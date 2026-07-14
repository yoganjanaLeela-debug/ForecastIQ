#!/usr/bin/env python3
"""
Offline / development-only script. NOT run by run.sh or the test pipeline —
per the submission contract, the model must already be trained and committed
inside pickle/. Re-run this manually only if you want to regenerate
data/marketing_data.csv and pickle/model.pkl.

    python src/train.py

It:
  1. Generates a small, reproducible synthetic campaign dataset and writes
     it to data/marketing_data.csv (kept small on purpose, per the
     submission guide, so the repo runs out of the box).
  2. Builds features with the exact same src/features.build_features used
     at test time.
  3. Trains a RandomForestRegressor to predict revenue.
  4. Pickles {"model": ..., "feature_columns": ...} to pickle/model.pkl.
"""
import os
import pickle

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from features import build_features, FEATURE_COLUMNS, CHANNELS

SEED = 42


def generate_synthetic_data(n_rows: int = 600, seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    channel_profiles = {
        "Google Ads": dict(roas=4.8, ctr=3.4, cvr=0.06),
        "Meta Ads": dict(roas=3.1, ctr=2.1, cvr=0.04),
        "LinkedIn": dict(roas=2.4, ctr=0.9, cvr=0.03),
        "YouTube": dict(roas=2.9, ctr=1.4, cvr=0.02),
        "Email": dict(roas=6.2, ctr=5.8, cvr=0.08),
        "Display": dict(roas=1.6, ctr=0.5, cvr=0.015),
        "SEO": dict(roas=5.4, ctr=4.1, cvr=0.07),
    }
    campaign_names = [
        "Summer Sale Blitz", "Retarget Cart Abandon", "Brand Awareness Push",
        "LinkedIn ABM Campaign", "Display Remarketing", "Lookalike Scale",
        "Content Sprint", "Holiday Flash Promo", "New Customer Acquisition",
        "Loyalty Win-back",
    ]
    dates = pd.date_range("2025-01-01", periods=365, freq="D")

    rows = []
    for _ in range(n_rows):
        channel = rng.choice(CHANNELS)
        profile = channel_profiles[channel]
        date = rng.choice(dates)
        campaign = rng.choice(campaign_names)

        impressions = rng.integers(5_000, 250_000)
        ctr = max(0.001, rng.normal(profile["ctr"], profile["ctr"] * 0.25) / 100)
        clicks = int(impressions * ctr)
        cvr = max(0.001, rng.normal(profile["cvr"], profile["cvr"] * 0.25))
        conversions = int(clicks * cvr)
        spend = round(float(rng.normal(1.0, 0.15) * clicks * rng.uniform(0.4, 1.3)), 2)
        spend = max(spend, 50.0)

        roas = max(0.2, rng.normal(profile["roas"], profile["roas"] * 0.2))
        revenue = round(spend * roas, 2)

        rows.append({
            "date": pd.Timestamp(date).strftime("%Y-%m-%d"),
            "campaign": campaign,
            "channel": channel,
            "spend": spend,
            "impressions": int(impressions),
            "clicks": int(clicks),
            "conversions": int(conversions),
            "revenue": revenue,
        })

    return pd.DataFrame(rows)


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(repo_root, "data", "marketing_data.csv")
    model_path = os.path.join(repo_root, "pickle", "model.pkl")

    print("[train] generating synthetic sample dataset…")
    raw = generate_synthetic_data()
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    raw.to_csv(data_path, index=False)
    print(f"[train] wrote sample data to {data_path} ({len(raw)} rows)")

    features = build_features(raw)
    target = raw["revenue"].to_numpy(dtype=float)

    X = features[FEATURE_COLUMNS].to_numpy(dtype=float)
    X_train, X_test, y_train, y_test = train_test_split(
        X, target, test_size=0.2, random_state=SEED
    )

    model = RandomForestRegressor(
        n_estimators=200, max_depth=8, min_samples_leaf=3, random_state=SEED, n_jobs=-1
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"[train] holdout MAE: {mae:,.2f}  |  R^2: {r2:.3f}")

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    with open(model_path, "wb") as f:
        pickle.dump({"model": model, "feature_columns": FEATURE_COLUMNS}, f)
    print(f"[train] wrote trained model to {model_path}")


if __name__ == "__main__":
    main()
