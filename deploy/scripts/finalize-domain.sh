#!/usr/bin/env bash
# Timer hanya mengaktifkan vhost HTTPS setelah DNS authoritative siap.
set -euo pipefail
exec 9>/run/menujuakad-dns-finalize.lock
flock -n 9 || exit 0
deploy_dir=/srv/menujuakad/deploy
expected_ip=43.173.15.136
for nameserver in ns1.domainesia.net ns2.domainesia.net; do
  apex=$(dig +time=2 +tries=1 +short "@$nameserver" menujuakad.com A)
  www_cname=$(dig +time=2 +tries=1 +short "@$nameserver" www.menujuakad.com CNAME)
  www_a=$(dig +time=2 +tries=1 +short "@$nameserver" www.menujuakad.com A)
  apex_v6=$(dig +time=2 +tries=1 +short "@$nameserver" menujuakad.com AAAA)
  www_v6=$(dig +time=2 +tries=1 +short "@$nameserver" www.menujuakad.com AAAA)
  if [[ "$apex" != "$expected_ip" ]] ||
     [[ "$www_cname" != 'menujuakad.com.' && "$www_a" != "$expected_ip" ]] ||
     [[ -n "$apex_v6" ]] ||
     [[ -n "$www_v6" && "$www_v6" != 'menujuakad.com.' ]]; then
    printf 'DNS belum siap pada %s; konfigurasi tidak diubah.\n' "$nameserver"
    exit 0
  fi
done

python3 - <<'PY'
from pathlib import Path
base = Path('/srv/menujuakad/deploy')
current = Path('/etc/caddy/Caddyfile').read_text()
staged = (base / 'Caddyfile.http').read_text()
final = (base / 'Caddyfile.https').read_text()
if current.count(staged) == 1:
    (base / 'Caddyfile.https-candidate').write_text(current.replace(staged, final, 1))
elif current.count(final) == 1:
    (base / 'Caddyfile.https-candidate').write_text(current)
else:
    raise SystemExit('Vhost staging berubah; perlu inspeksi manual, tidak menimpa konfigurasi.')
PY

candidate="$deploy_dir/Caddyfile.https-candidate"
if ! cmp -s "$candidate" /etc/caddy/Caddyfile; then
  caddy validate --config "$candidate" --adapter caddyfile
  backup=/srv/menujuakad/backups/Caddyfile.before-https
  cp -a /etc/caddy/Caddyfile "$backup"
  chmod 0600 "$backup"
  install -o root -g root -m 0644 "$candidate" /etc/caddy/Caddyfile
  if ! systemctl reload caddy; then
    cp -a "$backup" /etc/caddy/Caddyfile
    systemctl reload caddy
    exit 1
  fi
fi

# Tanpa -k: hanya dianggap siap jika sertifikat publik benar-benar valid.
# Resolver publik menghindari cache lama di resolver VPS setelah perpindahan A.
curl --fail --silent --show-error --max-time 12 --doh-url https://cloudflare-dns.com/dns-query https://menujuakad.com/api/health/live
curl --fail --silent --show-error --max-time 12 --doh-url https://cloudflare-dns.com/dns-query --location https://www.menujuakad.com/api/health/live
date -Is > "$deploy_dir/https-verified-at.txt"
systemctl disable --now menujuakad-domain.timer
printf '\nHTTPS apex/www dan liveness terverifikasi; timer dihentikan.\n'
