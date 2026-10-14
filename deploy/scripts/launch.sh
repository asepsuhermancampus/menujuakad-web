#!/usr/bin/env bash
# Build/deploy akun sendiri; runtime secrets tidak masuk artifact atau log.
set -euo pipefail
umask 077
fail() { printf '%s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 1002 && $HOME == /home/kebeletwebdev ]] || fail "Jalankan sebagai kebeletwebdev dari sesi SSH sendiri."
export DOCKER_HOST=unix:///run/user/1002/docker.sock
export DOCKER_CONFIG=/home/kebeletwebdev/.docker
export XDG_RUNTIME_DIR=/run/user/1002
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1002/bus
unset DOCKER_CONTEXT MENUJUAKAD_IMAGE MENUJUAKAD_PORT
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
state=$HOME/.local/share/menujuakad
cd "$repo"
mode=build
image=
dry=0
case "${1:-}" in
  '') ;;
  --image) [[ $# == 2 ]] || fail "Pemakaian: $0 --image TAG_ATAU_SHA"; mode=image; image=$2 ;;
  --rollback) [[ $# == 1 ]] || fail "Pemakaian: $0 --rollback"; mode=rollback ;;
  --candidate) [[ $# == 2 ]] || fail "Pemakaian: $0 --candidate TAG_ATAU_SHA"; mode=candidate; image=$2 ;;
  --dry-run) dry=1; shift; if [[ $# == 2 && $1 == --image ]]; then mode=image; image=$2; elif [[ $# != 0 ]]; then fail "Pemakaian: $0 --dry-run [--image TAG_ATAU_SHA]"; fi ;;
  *) fail "Pemakaian: $0 [--image TAG_ATAU_SHA | --rollback | --candidate TAG_ATAU_SHA | --dry-run [--image TAG_ATAU_SHA]]" ;;
esac
[[ -S /run/user/1002/docker.sock ]] || fail "Daemon rootless belum aktif: systemctl --user start docker"
[[ $(stat -c %u /run/user/1002/docker.sock) == 1002 ]] || fail "Owner socket salah."
[[ $(docker info --format '{{.DockerRootDir}}') == "$HOME/.local/share/docker" ]] || fail "Penyimpanan daemon salah."
docker info --format '{{json .SecurityOptions}}' | python3 -c 'import sys,json; assert "name=rootless" in json.load(sys.stdin)'
[[ -f $state/runtime.env && ! -L $state/runtime.env && $(stat -c %u:%a "$state/runtime.env") == 1002:600 ]] || fail "Runtime environment harus berkas privat akun (0600)."
exec 9>"$state/launch.lock"
flock -n 9 || fail "Launch lain sedang berjalan."
compose() {
  local project=$1 port=$2 ref=$3; shift 3
  MENUJUAKAD_IMAGE=$ref MENUJUAKAD_PORT=$port docker compose --project-name "$project" \
    -f "$repo/deploy/compose.yaml" -f "$repo/deploy/compose.neon.yaml" -f "$repo/deploy/compose.rootless.yaml" "$@"
}
previous=
if [[ -f $state/release.env ]]; then
  previous=$(sed -n 's/^MENUJUAKAD_IMAGE=//p' "$state/release.env")
  [[ $previous =~ ^sha256:[a-f0-9]{64}$ ]] || fail "Pointer release tidak valid."
fi
if [[ $mode == rollback ]]; then
  [[ -f $state/previous.env ]] || fail "Belum ada release sebelumnya."
  image=$(sed -n 's/^MENUJUAKAD_IMAGE=//p' "$state/previous.env")
  [[ $image =~ ^sha256:[a-f0-9]{64}$ ]] || fail "Pointer rollback tidak valid."
fi
if [[ -n $image ]]; then
  image=$(docker image inspect "$image" --format '{{.Id}}')
  [[ $(docker image inspect "$image" --format '{{.Config.User}}') == node ]] || fail "Image wajib berjalan sebagai node."
fi
if [[ $dry == 1 ]]; then
  compose menujuakad 3100 "${image:-${previous:-menujuakad-web:dry-run}}" config --quiet
  if [[ $mode == build ]]; then
    command -v node >/dev/null; command -v npm >/dev/null
    [[ -f package-lock.json && -f deploy/Dockerfile && -d node_modules ]] || fail "Dependency/build source belum tersedia."
  fi
  printf 'PASS dry-run: UID1002, engine rootless sendiri, runtime privat, Compose valid; mode=%s. Tidak ada build atau switch.\n' "$mode"
  exit 0
fi
if [[ $mode == build ]]; then
  release=$(mktemp -d "$state/releases/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
  NEXT_PUBLIC_APP_URL=https://menujuakad.com npm run build
  bash "$repo/deploy/scripts/package-standalone.sh" "$release/standalone.tar.gz"
  mkdir "$release/context"
  tar -xzf "$release/standalone.tar.gz" -C "$release/context"
  tag="menujuakad-web:user-$(basename "$release" | tr '[:upper:]' '[:lower:]')"
  docker build -f "$repo/deploy/Dockerfile" -t "$tag" "$release/context"
  image=$(docker image inspect "$tag" --format '{{.Id}}')
fi
[[ -n $image ]] || fail "Image belum ditentukan."
build_id=$(docker run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges:true --entrypoint cat "$image" /app/.next/BUILD_ID)
[[ $build_id =~ ^[A-Za-z0-9_-]+$ ]] || fail "BUILD_ID image tidak valid."
probe() {
  local origin=$1 code path
  for path in / /login /brand/logo-menujuakad.svg /fonts/pjs-800.ttf /api/health/live /api/auth/capabilities; do
    curl --noproxy '*' -fsS --max-time 15 "$origin$path" -o /dev/null || return 1
  done
  curl --noproxy '*' -fsS --max-time 15 "$origin/api/health" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["status"] == "ok" and d["checks"]["database"] == "ok"' || return 1
  python3 - "$origin" <<'GUARD' || return 1
import sys, urllib.request, urllib.parse
from html.parser import HTMLParser
class Redirect(HTMLParser):
    target = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and a.get("id") == "__next-page-redirect" and a.get("http-equiv") == "refresh":
            self.target = a.get("content")
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
for path in ("/dashboard", "/admin", "/account"):
    with opener.open(sys.argv[1]+path, timeout=15) as response:
        body = response.read().decode()
        url = urllib.parse.urlsplit(response.url)
        if url.path == "/login":
            assert urllib.parse.parse_qs(url.query).get("next") == [path]
        else:
            parser = Redirect(); parser.feed(body)
            assert response.status == 200 and parser.target == "1;url=/login?next="+urllib.parse.quote(path, safe="")
            assert "NEXT_REDIRECT" in body
GUARD
  code=$(curl --noproxy '*' -sS --max-time 15 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' --data '{}' "$origin/api/auth/login") || return 1
  [[ $code == 403 ]]
}
health() {
  local origin=$1
  for attempt in 1 2 3 4 5; do
    if probe "$origin"; then return 0; fi
    sleep 2
  done
  return 1
}
switch_started=0
success=0
candidate_started=0
cleanup() {
  local result=$?
  trap - EXIT INT TERM
  set +e
  if [[ $switch_started == 1 && $success == 0 && -n $previous ]]; then
    printf 'Switch gagal; mengembalikan image rootless sebelumnya.\n' >&2
    compose menujuakad 3100 "$previous" up -d --wait --wait-timeout 90 --force-recreate web
    health http://127.0.0.1:3100 || printf 'Rollback perlu pemeriksaan operator.\n' >&2
  fi
  if [[ $candidate_started == 1 && ( $mode != candidate || $success == 0 ) ]]; then
    compose menujuakad-candidate-rootless 3101 "$image" stop web >/dev/null
    compose menujuakad-candidate-rootless 3101 "$image" rm --force web >/dev/null
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
candidate_started=1
compose menujuakad-candidate-rootless 3101 "$image" up -d --wait --wait-timeout 90 web
health http://127.0.0.1:3101 || fail "Kandidat gagal readiness/routing; produksi belum disentuh."
candidate_id=$(compose menujuakad-candidate-rootless 3101 "$image" ps -q web)
[[ $(docker exec "$candidate_id" cat /app/.next/BUILD_ID) == "$build_id" ]] || fail "BUILD_ID kandidat berbeda."
printf 'PASS kandidat: healthy, database ok, guard/CSRF/aset lulus; BUILD_ID=%s\n' "$build_id"
if [[ $mode == candidate ]]; then success=1; exit 0; fi
switch_started=1
compose menujuakad 3100 "$image" up -d --wait --wait-timeout 90 --force-recreate web
health http://127.0.0.1:3100 || fail "Produksi lokal gagal health."
health https://menujuakad.com || fail "Produksi HTTPS gagal health."
curl --noproxy '*' -fsSL --max-time 20 https://www.menujuakad.com/ -o /dev/null || fail "HTTPS www gagal."
production_id=$(compose menujuakad 3100 "$image" ps -q web)
[[ $(docker exec "$production_id" cat /app/.next/BUILD_ID) == "$build_id" ]] || fail "BUILD_ID produksi berbeda."
if [[ -n $previous && $previous != "$image" ]]; then
  printf 'MENUJUAKAD_IMAGE=%s\n' "$previous" > "$state/previous.env.new"
  mv "$state/previous.env.new" "$state/previous.env"
fi
printf 'MENUJUAKAD_IMAGE=%s\n' "$image" > "$state/release.env.new"
mv "$state/release.env.new" "$state/release.env"
success=1
printf 'PASS launch: https://menujuakad.com healthy; UID1002 rootless; image=%s BUILD_ID=%s\n' "$image" "$build_id"
