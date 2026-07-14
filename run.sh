#!/usr/bin/env bash
set -euo pipefail

# Accept arguments, fall back to sensible defaults for local runs.
DATA_DIR="${1:-./data}"
MODEL_PATH="${2:-./pickle/model.pkl}"
OUTPUT_PATH="${3:-./output/predictions.csv}"

# Resolve paths relative to this script's location so run.sh works no
# matter what directory it's invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p "$(dirname "$OUTPUT_PATH")"
FEATURES_PATH="$(mktemp -u ./features_XXXXXX.parquet)"
trap 'rm -f "$FEATURES_PATH"' EXIT

echo "[run.sh] DATA_DIR=$DATA_DIR  MODEL_PATH=$MODEL_PATH  OUTPUT_PATH=$OUTPUT_PATH"

# 1. Generate the features the model needs from whatever is in DATA_DIR
python3 src/generate_features.py \
    --data-dir "$DATA_DIR" \
    --out "$FEATURES_PATH"

# 2. Load the pickled model and produce predictions
python3 src/predict.py \
    --features "$FEATURES_PATH" \
    --model "$MODEL_PATH" \
    --output "$OUTPUT_PATH"

echo "[run.sh] Done. Predictions written to $OUTPUT_PATH"
