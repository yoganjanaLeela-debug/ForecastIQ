#!/usr/bin/env python3
"""
Step 1 of the pipeline: read every CSV file found in --data-dir, engineer
features, and write a single feature table to --out.

Usage:
    python src/generate_features.py --data-dir ./data --out features.parquet

Reads by pattern (any *.csv in the folder), not by a hardcoded filename, so
this keeps working when the folder's contents are replaced at test time.
"""
import argparse
import glob
import os
import sys

import pandas as pd

from features import build_features


def parse_args():
    p = argparse.ArgumentParser(description="Generate model features from raw campaign data.")
    p.add_argument("--data-dir", default="./data", help="Folder containing input CSV file(s).")
    p.add_argument("--out", default="features.parquet", help="Path to write the feature table to.")
    return p.parse_args()


def main():
    args = parse_args()

    csv_paths = sorted(glob.glob(os.path.join(args.data_dir, "*.csv")))
    if not csv_paths:
        print(f"[generate_features] ERROR: no .csv files found in {args.data_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"[generate_features] found {len(csv_paths)} csv file(s) in {args.data_dir}:")
    for path in csv_paths:
        print(f"  - {path}")

    frames = [pd.read_csv(path) for path in csv_paths]
    raw = pd.concat(frames, ignore_index=True)
    print(f"[generate_features] loaded {len(raw):,} raw row(s)")

    features = build_features(raw)
    print(f"[generate_features] engineered {features.shape[1]} feature column(s) "
          f"for {len(features):,} row(s)")

    out_dir = os.path.dirname(args.out)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    features.to_parquet(args.out, index=False)
    print(f"[generate_features] wrote {args.out}")


if __name__ == "__main__":
    main()
