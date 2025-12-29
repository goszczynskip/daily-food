#!/usr/bin/env bash

FEATURES_JSON="$1"

if [ "$FEATURES_JSON" != "[]" ]; then
  echo "$FEATURES_JSON" | jq -c '.[]' | while read -r item; do
    feature=$(echo "$item" | jq -r '.feature')
    version=$(echo "$item" | jq -r '.version')
    echo "Installing feature: $feature@$version"
    pnpm boring-stack add "$feature" "$version" --yes
  done
else
  echo "No features to install"
fi

