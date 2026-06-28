#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/home/ubuntu/feedyruby}"
DOMAIN="${DOMAIN:-feedyruby.ir}"
APP_IMAGE="${APP_IMAGE:-amirmpa/feedyruby:latest}"
APP_IMAGE_MIRROR="${APP_IMAGE_MIRROR:-hub.hamdocker.ir/amirmpa/feedyruby:latest}"

log() { echo "[finish-deploy] $*"; }

if [[ -f /home/ubuntu/feedyruby-fallback-images.tar.gz ]]; then
  log "Loading application images from tarball..."
  gunzip -c /home/ubuntu/feedyruby-fallback-images.tar.gz | sudo docker load
fi

log "Pulling FeedyRuby app image (${APP_IMAGE})..."
if ! sudo docker pull "${APP_IMAGE}"; then
  log "Docker Hub pull failed; trying HamDocker mirror (${APP_IMAGE_MIRROR})..."
  sudo docker pull "${APP_IMAGE_MIRROR}"
  sudo docker tag "${APP_IMAGE_MIRROR}" "${APP_IMAGE}"
fi

log "Tagging images for compose..."
sudo docker tag "${APP_IMAGE}" feedyruby-app:latest
sudo docker tag ghcr.io/feedyruby/hub:0.5.0 feedyruby-hub:0.5.0 2>/dev/null || \
  sudo docker tag ghcr.io/formbricks/hub:0.5.0 feedyruby-hub:0.5.0 2>/dev/null || \
  sudo docker tag hub.hamdocker.ir/formbricks/hub:0.5.0 feedyruby-hub:0.5.0 2>/dev/null || true

log "Patching docker-compose image references..."
cd "${INSTALL_DIR}"
sed -i \
  -e 's|ghcr\.hamdocker\.ir/feedyruby/feedyruby:latest|'"${APP_IMAGE}"'|g' \
  -e 's|ghcr\.io/feedyruby/feedyruby:latest|'"${APP_IMAGE}"'|g' \
  -e 's|image: feedyruby-app:latest|image: '"${APP_IMAGE}"'|g' \
  -e 's|ghcr\.hamdocker\.ir/feedyruby/hub:latest|feedyruby-hub:0.5.0|g' \
  -e 's|ghcr\.hamdocker\.ir/feedyruby/hub${HUB_IMAGE_REF:-:latest}|feedyruby-hub:0.5.0|g' \
  -e 's|ghcr\.io/feedyruby/hub${HUB_IMAGE_REF:-:latest}|feedyruby-hub:0.5.0|g' \
  -e 's|ghcr\.io/feedyruby/hub:latest|feedyruby-hub:0.5.0|g' \
  -e 's|hub\.hamdocker\.ir/valkey/valkey@sha256:[a-f0-9]*|hub.hamdocker.ir/valkey/valkey:latest|g' \
  -e 's|valkey/valkey@sha256:[a-f0-9]*|hub.hamdocker.ir/valkey/valkey:latest|g' \
  docker-compose.yml

# Ensure hub image ref is literal in compose
sed -i 's|image: feedyruby-hub:${HUB_IMAGE_REF:-:latest}|image: feedyruby-hub:0.5.0|g' docker-compose.yml
sed -i 's|image: feedyruby-hub:0.5.0${HUB_IMAGE_REF:-:latest}|image: feedyruby-hub:0.5.0|g' docker-compose.yml

log "Starting stack..."
sudo docker compose up -d

log "Container status:"
sudo docker compose ps

log "Removing leftover deploy tarballs..."
rm -f /home/ubuntu/feedyruby-app-latest.tar.gz /home/ubuntu/feedyruby-fallback-images.tar.gz

log "Pruning unused Docker images (keeps running stack)..."
sudo docker image prune -f

log "Done — open https://${DOMAIN} (may take 1-2 min for migrations + SSL)"
