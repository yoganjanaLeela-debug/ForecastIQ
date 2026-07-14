#!/usr/bin/env python3
"""
Step 2 of the pipeline: load the trained model from --model, run it over
--features, and write predictions to --output.

Usage:
    python src/predict.py --features features.parquet --model ./pickle/model.pkl \
        --output ./output/predictions.csv
"""
import argparse
import os
import pickle
import sys

import numpy as np
import pandas as pd

from features import FEATURE_COLUMNS


def parse_args():
    p = argparse.ArgumentParser(description="Run the trained model over engineered features.")
    p.add_argument("--features", default="features.parquet", help="Path to the feature table.")
    p.add_argument("--model", default="./pickle/model.pkl", help="Path to the pickled model.")
    p.add_argument("--output", default="./output/predictions.csv", help="Where to write predictions.")
    return p.parse_args()


def main():
    args = parse_args()

    if not os.path.exists(args.model):
        print(f"[predict] ERROR: model file not found at {args.model}", file=sys.stderr)
        sys.exit(1)

    with open(args.model, "rb") as f:
        bundle = pickle.load(f)
    model = bundle["model"]
    trained_feature_columns = bundle["feature_columns"]

    df = pd.read_parquet(args.features)
    print(f"[predict] loaded {len(df):,} row(s) from {args.features}")

    missing = [c for c in trained_feature_columns if c not in df.columns]
    if missing:
        print(f"[predict] ERROR: features are missing column(s) the model expects: {missing}",
              file=sys.stderr)
        sys.exit(1)

    X = df[trained_feature_columns].to_numpy(dtype=float)

    # Point prediction plus a simple 90% interval derived from the spread of
    # individual tree predictions in the random forest.
    per_tree = np.stack([tree.predict(X) for tree in model.estimators_], axis=0)
    predicted_revenue = per_tree.mean(axis=0)
    spread = per_tree.std(axis=0)
    lower = predicted_revenue - 1.645 * spread
    upper = predicted_revenue + 1.645 * spread

    predicted_revenue = np.clip(predicted_revenue, 0, None)
    lower = np.clip(lower, 0, None)
    upper = np.clip(upper, 0, None)

    spend = df["spend"].to_numpy(dtype=float)
    with np.errstate(divide="ignore", invalid="ignore"):
        predicted_roas = np.where(spend > 0, predicted_revenue / spend, 0.0)

    result = pd.DataFrame({
        "date": df["date"].dt.strftime("%Y-%m-%d"),
        "campaign": df["campaign"],
        "channel": df["channel"],
        "predicted_revenue": np.round(predicted_revenue, 2),
        "predicted_revenue_lower": np.round(lower, 2),
        "predicted_revenue_upper": np.round(upper, 2),
        "predicted_roas": np.round(predicted_roas, 3),
    })

    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    result.to_csv(args.output, index=False)
    print(f"[predict] wrote {len(result):,} prediction(s) to {args.output}")


if __name__ == "__main__":
    main()
