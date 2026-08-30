# Chameleon — Joan Heemskerk (JODI) with Billy Rennekamp, 2021.
#
# Each token's artwork is a function of its current owner: gen.js paints 41
# 320x320 canvas frames using the owner's address as both palette and content,
# concatenates one mp3 per hex character of that address, and muxes the two into
# an mp4. A transfer therefore produces a *new* video, and the old one stays on
# disk — output/ is keyed by tokenID+owner, not by tokenID.
#
# ubuntu:20.04 rather than a node base image, for ffmpeg. The droplet runs
# ffmpeg 4.2.7 (focal), which is the encoder that produced every published mp4;
# Debian bullseye ships 4.3 and bookworm 5.1, and libx264 output is not stable
# across those. Focal is the version pin.
#
# Node is fetched as the official binary tarball because nodesource no longer
# publishes 12.x. 12.18.1 is the version PM2 actually launched the droplet
# process with (its `node -v` on the login shell says 12.22.12 — a different
# nvm install, and not the one serving traffic).
#
# canvas is left to install its own prebuilt binary, which is what the droplet
# has: it bundles cairo, pango, freetype, libpng, libjpeg and libgif inside
# node_modules/canvas/build/Release, so the rendering stack is self-contained
# and does not vary with what this image happens to have installed.
FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl xz-utils ffmpeg \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_VERSION=12.18.1
RUN curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
 && tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
 && rm "node-v${NODE_VERSION}-linux-x64.tar.xz" \
 && node -v && ffmpeg -version | head -1

WORKDIR /app

# git: folia-contracts is a github: dependency.
RUN apt-get update && apt-get install -y --no-install-recommends git \
 && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN npm install --production --no-audit --no-fund \
 && apt-get purge -y git && apt-get autoremove -y

# The drawing assets: one png per hex character in two styles, one mp3 per hex
# character, plus the o/x/game sprites. gen.js reads these by relative path, so
# they must sit next to the code and the working directory must be /app.
COPY bitimg ./bitimg
COPY bitbitimg ./bitbitimg
COPY bithex ./bithex
COPY public ./public
COPY views ./views
COPY routes ./routes
COPY bin ./bin
COPY app.js gen.js ./

COPY fly/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ARG GIT_SHA=unknown
ARG BUILD_TIME=
ENV GIT_SHA=$GIT_SHA BUILD_TIME=$BUILD_TIME

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "./bin/www"]
