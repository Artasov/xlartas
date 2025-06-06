#!/bin/sh
set -e

# Build the React application
npm run build

# Copy the build to the mounted volume if present
if [ -d /srv/frontend/build ]; then
  rm -rf /srv/frontend/build
  mkdir -p /srv/frontend
  cp -R build /srv/frontend/
fi
