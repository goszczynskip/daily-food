#!/usr/bin/env bash

JQ_TRANSFORM='.data.tonik as $features |
  reduce range(0; $features | length) as $i (
    { result: [] };
    $features[$i] as $f |
    .result as $current |
    reduce $f.versions[] as $v (
      . ;
      .result += [ [{ feature: $f.name, version: $v }] ] |
      .result += ( $current | map(. + [{ feature: $f.name, version: $v }]) )
    )
  ) | [ [] ] + .result'

FEATURES_MATRIX=$(pnpm boring-stack list --output json | jq -c "$JQ_TRANSFORM")

echo "$FEATURES_MATRIX"
