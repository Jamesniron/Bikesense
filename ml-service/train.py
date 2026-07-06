"""
BikeSense ML Training Script
Trains XGBoost, Decision Tree, and Linear Regression models on synthetic
Sri Lankan used motorcycle market data and serializes the best model.
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import json

# ─── Reproducibility ──────────────────────────────────────────────────────────
np.random.seed(42)

# ─── Synthetic Dataset Generation ────────────────────────────────────────────
BRANDS = ["Honda", "Yamaha", "Bajaj", "Suzuki", "TVS", "Hero", "KTM", "Vespa"]
MODELS = {
    "Honda":  ["Dio", "CB Shine", "CB Unicorn", "Hornet", "CB150R"],
    "Yamaha": ["FZ", "R15", "MT15", "FZS", "Saluto"],
    "Bajaj":  ["Pulsar", "Avenger", "CT100", "Platina"],
    "Suzuki": ["Gixxer", "GSX", "Burgman", "Bandit"],
    "TVS":    ["Apache", "Jupiter", "Ntorq", "Star City"],
    "Hero":   ["Splendor", "Passion", "Glamour", "Xtreme"],
    "KTM":    ["Duke 200", "Duke 390", "RC 125"],
    "Vespa":  ["SXL", "VXL", "Notte"],
}
CONDITIONS   = ["Excellent", "Good", "Fair", "Poor"]
SERVICE_HIST = ["Full", "Partial", "None"]
ACCIDENT_HIST= ["None", "Minor", "Major"]

BRAND_BASE_PRICES = {
    "Honda": 320000, "Yamaha": 340000, "Suzuki": 300000, "Vespa": 420000,
    "KTM": 480000, "Bajaj": 255000, "TVS": 250000, "Hero": 240000,
}
CONDITION_MULTIPLIER  = {"Excellent": 1.10, "Good": 1.00, "Fair": 0.83, "Poor": 0.62}
SERVICE_MULTIPLIER    = {"Full": 1.05, "Partial": 1.00, "None": 0.94}
ACCIDENT_MULTIPLIER   = {"None": 1.00, "Minor": 0.84, "Major": 0.60}

def generate_dataset(n: int = 3000) -> pd.DataFrame:
    rows = []
    for _ in range(n):
        brand  = np.random.choice(BRANDS)
        model  = np.random.choice(MODELS[brand])
        year   = np.random.randint(2005, 2025)
        age    = 2025 - year

        # Engine CC distribution by brand
        if brand in ("KTM", "Suzuki"):
            cc = np.random.choice([200, 250, 390, 150], p=[0.3, 0.3, 0.25, 0.15])
        elif brand == "Vespa":
            cc = np.random.choice([125, 150], p=[0.5, 0.5])
        else:
            cc = np.random.choice([100, 110, 125, 150, 160], p=[0.25, 0.30, 0.20, 0.15, 0.10])

        mileage      = int(np.clip(np.random.normal(loc=age * 8000, scale=12000), 500, 200000))
        condition    = np.random.choice(CONDITIONS, p=[0.25, 0.45, 0.22, 0.08])
        service_hist = np.random.choice(SERVICE_HIST, p=[0.40, 0.35, 0.25])
        accident     = np.random.choice(ACCIDENT_HIST, p=[0.65, 0.25, 0.10])
        owner_count  = np.random.choice([1, 2, 3, 4], p=[0.45, 0.35, 0.15, 0.05])

        # Price calculation
        base     = BRAND_BASE_PRICES[brand]
        base    += (cc - 100) * 1600
        deprec   = max(1 - age * 0.065, 0.25)
        price    = base * deprec
        price   -= mileage * 1.50
        price   *= CONDITION_MULTIPLIER[condition]
        price   *= SERVICE_MULTIPLIER[service_hist]
        price   *= ACCIDENT_MULTIPLIER[accident]
        if owner_count > 2:
            price *= 0.93
        noise    = np.random.normal(1.0, 0.06)  # ±6% market noise
        price    = max(price * noise, 35000)

        rows.append({
            "Brand": brand, "Model": model, "Year": year, "Mileage": mileage,
            "EngineCC": cc, "Condition": condition, "ServiceHistory": service_hist,
            "AccidentHistory": accident, "OwnerCount": owner_count,
            "Price": round(price, 0)
        })
    return pd.DataFrame(rows)


# ─── Feature Engineering ──────────────────────────────────────────────────────
def engineer_features(df: pd.DataFrame):
    df = df.copy()
    df["Age"] = 2025 - df["Year"]

    le_brand  = LabelEncoder()
    le_model  = LabelEncoder()
    le_cond   = LabelEncoder()
    le_serv   = LabelEncoder()
    le_acc    = LabelEncoder()

    df["Brand_enc"]     = le_brand.fit_transform(df["Brand"])
    df["Model_enc"]     = le_model.fit_transform(df["Model"])
    df["Condition_enc"] = le_cond.fit_transform(df["Condition"])
    df["Service_enc"]   = le_serv.fit_transform(df["ServiceHistory"])
    df["Accident_enc"]  = le_acc.fit_transform(df["AccidentHistory"])

    encoders = {
        "brand": le_brand, "model": le_model,
        "condition": le_cond, "service": le_serv, "accident": le_acc,
    }

    feature_cols = ["Brand_enc", "Model_enc", "Age", "Mileage", "EngineCC",
                    "Condition_enc", "Service_enc", "Accident_enc", "OwnerCount"]
    X = df[feature_cols]
    y = df["Price"]
    return X, y, encoders, feature_cols


# ─── Model Training ───────────────────────────────────────────────────────────
def train_and_evaluate(X_train, X_test, y_train, y_test):
    results = {}

    # 1. Linear Regression (Baseline)
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)
    results["LinearRegression"] = {
        "model": lr,
        "MAE":   round(mean_absolute_error(y_test, lr_preds), 2),
        "RMSE":  round(np.sqrt(mean_squared_error(y_test, lr_preds)), 2),
        "R2":    round(r2_score(y_test, lr_preds), 4)
    }

    # 2. Decision Tree
    dt = DecisionTreeRegressor(max_depth=10, random_state=42)
    dt.fit(X_train, y_train)
    dt_preds = dt.predict(X_test)
    results["DecisionTree"] = {
        "model": dt,
        "MAE":   round(mean_absolute_error(y_test, dt_preds), 2),
        "RMSE":  round(np.sqrt(mean_squared_error(y_test, dt_preds)), 2),
        "R2":    round(r2_score(y_test, dt_preds), 4)
    }

    # 3. XGBoost (Primary Production Model)
    xgb_model = xgb.XGBRegressor(
        n_estimators=500, learning_rate=0.05, max_depth=7,
        subsample=0.85, colsample_bytree=0.85,
        reg_alpha=0.1, reg_lambda=1.0,
        random_state=42, n_jobs=-1
    )
    xgb_model.fit(X_train, y_train,
                  eval_set=[(X_test, y_test)], verbose=False)
    xgb_preds = xgb_model.predict(X_test)
    results["XGBoost"] = {
        "model": xgb_model,
        "MAE":   round(mean_absolute_error(y_test, xgb_preds), 2),
        "RMSE":  round(np.sqrt(mean_squared_error(y_test, xgb_preds)), 2),
        "R2":    round(r2_score(y_test, xgb_preds), 4)
    }

    return results


# ─── Main Training Pipeline ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  BikeSense ML Training Pipeline")
    print("=" * 60)

    # Step 1 – Generate dataset
    print("\n[1/5] Generating synthetic Sri Lankan motorcycle dataset...")
    df = generate_dataset(n=4000)
    print(f"      Dataset shape: {df.shape}")

    # Step 2 – Feature engineering
    print("[2/5] Engineering features...")
    X, y, encoders, feature_cols = engineer_features(df)

    # Step 3 – Train/test split
    print("[3/5] Splitting into train/test sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Step 4 – Train models
    print("[4/5] Training models...")
    results = train_and_evaluate(X_train, X_test, y_train, y_test)

    print("\n  --- Model Evaluation Metrics ---")
    best_model_name = None
    best_r2 = -999
    for name, res in results.items():
        print(f"  {name:20s} | MAE={res['MAE']:>10,.0f} | RMSE={res['RMSE']:>10,.0f} | R2={res['R2']:.4f}")
        if res["R2"] > best_r2:
            best_r2 = res["R2"]
            best_model_name = name

    print(f"  >> Best model: {best_model_name} (R2={best_r2:.4f})")

    # Step 5 – Serialize artifacts
    print("[5/5] Serializing model artifacts to models/...")
    os.makedirs("models", exist_ok=True)

    best_model = results[best_model_name]["model"]
    joblib.dump(best_model, "models/price_model.joblib")
    joblib.dump(encoders,    "models/encoders.joblib")

    # Save metadata for the API to use
    metadata = {
        "best_model": best_model_name,
        "feature_cols": feature_cols,
        "metrics": {k: {m: v for m, v in res.items() if m != "model"}
                    for k, res in results.items()},
        "encoder_classes": {
            "brand":     list(encoders["brand"].classes_),
            "model":     list(encoders["model"].classes_),
            "condition": list(encoders["condition"].classes_),
            "service":   list(encoders["service"].classes_),
            "accident":  list(encoders["accident"].classes_),
        }
    }
    with open("models/metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n  Artifacts saved:")
    print("    models/price_model.joblib")
    print("    models/encoders.joblib")
    print("    models/metadata.json")
    print("\n  [DONE] Training complete!")
