#!/usr/bin/env bash
# Menyiapkan artifact lokal saja; tidak menghubungi VPS atau memulai service.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'Pemakaian: %s /path/di-luar-repo/release.tar.gz\n' "$0" >&2
  exit 2
fi
repo_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
artifact_path=$(realpath -m -- "$1")
standalone_dir="$repo_dir/.next/standalone"
case "$artifact_path" in
  "$repo_dir"|"$repo_dir"/*)
    printf 'Artifact harus disimpan di luar repository.\n' >&2
    exit 2
    ;;
esac
if [[ -e "$artifact_path" ]]; then
  printf 'Tujuan sudah ada; pilih nama artifact baru.\n' >&2
  exit 2
fi
for required in server.js .next/BUILD_ID .next/static public; do
  if [[ ! -e "$standalone_dir/$required" ]]; then
    printf 'Standalone belum lengkap: %s. Jalankan build yang sudah lolos gate.\n' "$required" >&2
    exit 1
  fi
done
if [[ -n "$(find "$standalone_dir" -type f \( -name '.env' -o -name '.env.*' -o -name 'id_rsa' -o -name 'id_ed25519' \) ! -name '.env.example' -print -quit)" ]]; then
  printf 'Artifact ditolak: ditemukan berkas environment/kunci privat.\n' >&2
  exit 1
fi
while IFS= read -r -d '' link_path; do
  link_target=$(realpath -m -- "$link_path")
  case "$link_target" in
    "$standalone_dir"/*) ;;
    *) printf 'Artifact ditolak: symlink mengarah ke luar standalone.\n' >&2; exit 1 ;;
  esac
done < <(find "$standalone_dir" -type l -print0)
node --check "$standalone_dir/server.js"
# Tidak ada build otomatis: artifact harus berasal dari increment tervalidasi.
tar --exclude='./.env.example' -czf "$artifact_path" -C "$standalone_dir" .
sha256sum -- "$artifact_path"
printf 'Artifact tersimpan; belum diunggah atau dijalankan.\n'
