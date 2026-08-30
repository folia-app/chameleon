#!/bin/sh
# output/ holds the published mp4s and go/ holds the frames and audio each was
# built from. Both are the artwork, both were migrated from the droplet rather
# than regenerated, and both live on the volume.
#
# routes/get.js serves the .png form of a token straight out of go/ (frame
# 00040), so go/ is not a scratch directory that could be dropped — it is on the
# read path.
set -e
mkdir -p /data/output /data/go
rm -rf /app/output /app/go
ln -sfn /data/output /app/output
ln -sfn /data/go /app/go

# checkCount() writes one file per token here on boot and daily; it ships empty.
mkdir -p /app/public/txt

echo "[entrypoint] $(ls /data/output 2>/dev/null | wc -l) videos, $(ls /data/go 2>/dev/null | wc -l) frame dirs"
exec "$@"
