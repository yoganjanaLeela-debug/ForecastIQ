"""
Shared feature engineering for ForecastIQ.

IMPORTANT: this module is imported by both src/train.py (used once, offline,
to produce the committed pickle/model.pkl) and src/generate_features.py
(run every time by run.sh, including at test time against held-out data).
Keeping the logic in one place guarantees train/test feature parity.

Design choices, and why:
- Every feature is computed independently, per row. We deliberately avoid
  lag/rolling features that depend on row order or on a specific number of
  historical rows, because the held-out test set may have a different
  number of records and no guaranteed continuity with our sample data.
- Channel names are mapped through a fixed vocabulary (CHANNELS) so the
  one-hot columns produced at test time always match what the model was
  trained on. Any unseen channel value safely falls into "channel_other"
  instead of crashing or silently producing a misaligned feature matrix.
- All divisions are guarded against zero denominators.
"""

from __future__ import annotations
import numpy as np
import pandas as pd

# Fixed vocabulary the model was trained on. Do not reorder — order defines
# the one-hot column order the model expects.
CHANNELS = ["Google Ads", "Meta Ads", "LinkedIn", "YouTube", "Email", "Display", "SEO"]

# Columns the trained model expects, in this exact order.
FEATURE_COLUMNS = (
    ["spend", "impressions", "clicks", "conversions", "ctr", "cpa", "conv_rate",
     "spend_per_impression", "day_of_week", "month", "is_weekend"]
    + [f"channel_{c.lower().replace(' ', '_')}" for c in CHANNELS]
    + ["channel_other"]
)

REQUIRED_RAW_COLUMNS = ["date", "campaign", "channel", "spend", "impressions", "clicks", "conversions"]


def _safe_div(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
    denom = denominator.replace(0, np.nan)
    result = numerator / denom
    return result.fillna(0.0)


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Turn raw campaign rows into the numeric feature matrix the model expects.

    Input: a DataFrame with at least REQUIRED_RAW_COLUMNS.
    Output: a DataFrame with identifier columns (date, campaign, channel)
    preserved, plus every column in FEATURE_COLUMNS, in FEATURE_COLUMNS order.
    """
    missing = [c for c in REQUIRED_RAW_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"Input data is missing required column(s): {missing}. "
            f"Expected at least: {REQUIRED_RAW_COLUMNS}"
        )

    out = df.copy()

    out["date"] = pd.to_datetime(out["date"], errors="coerce")
    if out["date"].isna().any():
        bad = int(out["date"].isna().sum())
        raise ValueError(f"{bad} row(s) have an unparseable 'date' value.")

    for col in ["spend", "impressions", "clicks", "conversions"]:
        out[col] = pd.to_numeric(out[col], errors="coerce").fillna(0.0)

    out["ctr"] = _safe_div(out["clicks"], out["impressions"])
    out["cpa"] = _safe_div(out["spend"], out["conversions"])
    out["conv_rate"] = _safe_div(out["conversions"], out["clicks"])
    out["spend_per_impression"] = _safe_div(out["spend"], out["impressions"])

    out["day_of_week"] = out["date"].dt.dayofweek
    out["month"] = out["date"].dt.month
    out["is_weekend"] = (out["day_of_week"] >= 5).astype(int)

    for c in CHANNELS:
        col_name = f"channel_{c.lower().replace(' ', '_')}"
        out[col_name] = (out["channel"] == c).astype(int)
    known = out["channel"].isin(CHANNELS)
    out["channel_other"] = (~known).astype(int)

    keep = ["date", "campaign", "channel"] + FEATURE_COLUMNS
    return out[keep]
