"""
BikeSense FastAPI ML Microservice
Exposes price prediction and recommendation endpoints backed by
a trained XGBoost model. Falls back to rule-based estimation when
model artifacts are not yet available.
"""

import json
import os
import math
from typing import List, Optional
from datetime import datetime

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── App Initialization ───────────────────────────────────────────────────────
app = FastAPI(
    title="BikeSense ML Microservice",
    description="XGBoost-powered motorcycle price prediction & recommendation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Model Loading ────────────────────────────────────────────────────────────
MODEL_DIR   = os.path.join(os.path.dirname(__file__), "models")
price_model = None
encoders    = None
metadata    = None

def load_artifacts():
    global price_model, encoders, metadata
    model_path    = os.path.join(MODEL_DIR, "price_model.joblib")
    encoders_path = os.path.join(MODEL_DIR, "encoders.joblib")
    meta_path     = os.path.join(MODEL_DIR, "metadata.json")

    if os.path.exists(model_path) and os.path.exists(encoders_path):
        price_model = joblib.load(model_path)
        encoders    = joblib.load(encoders_path)
        with open(meta_path) as f:
            metadata = json.load(f)
        print(f"[OK] Loaded model: {metadata.get('best_model')} from {MODEL_DIR}")
    else:
        print("!! Model artifacts not found. Run train.py first. Using rule-based fallback.")

load_artifacts()

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    Brand:           str = Field(..., example="Honda")
    Model:           str = Field(..., example="CB Shine")
    Year:            int = Field(..., ge=1990, le=2025, example=2020)
    Mileage:         int = Field(..., ge=0, example=18000)
    EngineCC:        int = Field(..., ge=50, le=1500, example=150)
    Condition:       str = Field("Good", example="Good")       # Excellent Good Fair Poor
    OwnerCount:      int = Field(1, ge=1, le=10, example=1)
    ServiceHistory:  str = Field("None", example="Full")       # Full Partial None
    AccidentHistory: str = Field("None", example="None")       # None Minor Major

class RecommendRequest(BaseModel):
    Budget:           float = Field(..., example=600000)
    UsageType:        str   = Field("commute", example="commute") # commute sport travel
    PreferredBrand:   Optional[str] = Field(None, example="Yamaha")
    MileagePriority:  str   = Field("medium", example="high")    # high medium low
    MaxCC:            Optional[int] = Field(None, example=150)

class DepreciationPoint(BaseModel):
    year: int
    value: float

class PredictResponse(BaseModel):
    predicted_price:      float
    health_score:         int
    deal_rating:          str
    depreciation_curve:   List[DepreciationPoint]
    bargain_price:        float
    annual_fuel_cost:     float
    annual_maintenance:   float
    annual_insurance:     float
    annual_license:       float
    model_used:           str

class RecommendedBike(BaseModel):
    brand:          str
    model:          str
    year_range:     str
    cc:             int
    score:          float
    reason:         str
    estimated_price: float

class RecommendResponse(BaseModel):
    recommendations: List[RecommendedBike]
    budget:          float
    usage_profile:   str

# ─── Core ML Logic ────────────────────────────────────────────────────────────
BRAND_BASE = {
    "honda": 320000, "yamaha": 340000, "suzuki": 300000, "vespa": 420000,
    "ktm": 480000,   "bajaj": 255000,  "tvs": 250000,    "hero": 240000,
}
COND_MULT = {"excellent": 1.10, "good": 1.00, "fair": 0.83, "poor": 0.62}
SERV_MULT = {"full": 1.05, "partial": 1.00, "none": 0.94}
ACC_MULT  = {"none": 1.00, "minor": 0.84, "major": 0.60}


def _rule_based_price(req: PredictRequest) -> float:
    brand = req.Brand.lower()
    base  = BRAND_BASE.get(brand, 280000)
    base += (req.EngineCC - 100) * 1600
    age   = 2025 - req.Year
    deprec = max(1 - age * 0.065, 0.25)
    price  = base * deprec
    price -= req.Mileage * 1.50
    price *= COND_MULT.get(req.Condition.lower(), 1.0)
    price *= SERV_MULT.get(req.ServiceHistory.lower(), 1.0)
    price *= ACC_MULT.get(req.AccidentHistory.lower(), 1.0)
    if req.OwnerCount > 2:
        price *= 0.92
    return max(price, 35000.0)


def _ml_price(req: PredictRequest) -> tuple[float, str]:
    """Run the trained XGBoost model. Returns (price, model_name)."""
    if price_model is None or encoders is None:
        return _rule_based_price(req), "rule-based-fallback"

    def safe_encode(le, val: str, default: int = 0) -> int:
        classes = list(le.classes_)
        # Try exact match first
        if val in classes:
            return int(le.transform([val])[0])
        # Try case-insensitive
        lower = val.lower()
        for c in classes:
            if c.lower() == lower:
                return int(le.transform([c])[0])
        return default

    age     = 2025 - req.Year
    b_enc   = safe_encode(encoders["brand"],     req.Brand)
    m_enc   = safe_encode(encoders["model"],     req.Model)
    c_enc   = safe_encode(encoders["condition"], req.Condition)
    s_enc   = safe_encode(encoders["service"],   req.ServiceHistory)
    a_enc   = safe_encode(encoders["accident"],  req.AccidentHistory)

    X = np.array([[b_enc, m_enc, age, req.Mileage, req.EngineCC,
                   c_enc, s_enc, a_enc, req.OwnerCount]])

    pred = float(price_model.predict(X)[0])
    return max(pred, 35000.0), metadata.get("best_model", "XGBoost")


def _health_score(req: PredictRequest) -> int:
    score = 100
    score -= req.Mileage // 5000           # -1 per 5k km
    score -= (2025 - req.Year) * 3         # -3 per year
    cond = req.Condition.lower()
    if cond == "good":    score -= 5
    elif cond == "fair":  score -= 20
    elif cond == "poor":  score -= 40
    acc = req.AccidentHistory.lower()
    if acc == "minor":    score -= 15
    elif acc == "major":  score -= 40
    serv = req.ServiceHistory.lower()
    if serv == "full":    score += 5
    elif serv == "none":  score -= 10
    return max(15, min(100, score))


def _depreciation_curve(base_price: float, condition: str) -> List[DepreciationPoint]:
    rates = {"excellent": 0.09, "good": 0.12, "fair": 0.16, "poor": 0.22}
    rate  = rates.get(condition.lower(), 0.12)
    curve = []
    val   = base_price
    for yr in range(1, 4):
        val  *= (1 - rate)
        curve.append(DepreciationPoint(year=yr, value=round(val, 0)))
    return curve


def _fuel_cost(cc: int) -> float:
    if cc < 110:   km_l = 60.0
    elif cc < 130: km_l = 52.0
    elif cc > 200: km_l = 30.0
    elif cc > 160: km_l = 38.0
    else:          km_l = 45.0
    liters = 12000 / km_l
    return round(liters * 370, 0)

# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/")
def root():
    model_status = metadata.get("best_model") if metadata else "rule-based-fallback"
    return {
        "service":      "BikeSense ML Microservice",
        "version":      "1.0.0",
        "model_loaded": price_model is not None,
        "model_name":   model_status,
        "endpoints":    ["/predict", "/recommend", "/health"]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_ready": price_model is not None}


@app.post("/predict", response_model=PredictResponse)
def predict_price(req: PredictRequest, list_price: Optional[float] = None):
    """
    Predict the fair market price of a used motorcycle.
    Optionally pass list_price as a query parameter to get a deal rating.
    """
    predicted, model_used = _ml_price(req)
    health   = _health_score(req)
    bargain  = round(predicted * 0.92, 0)
    depr     = _depreciation_curve(predicted, req.Condition)
    fuel     = _fuel_cost(req.EngineCC)
    age      = 2025 - req.Year
    maint    = 28000 if req.EngineCC > 200 else (18000 if req.EngineCC > 150 else 12000)
    if age > 8: maint += 8000
    insur    = 14500 if req.EngineCC > 150 else 6500
    license  = 4000  if req.EngineCC > 150 else 2500

    # Deal rating
    deal = "Fair Price"
    if list_price and list_price > 0:
        diff = list_price - predicted
        thr  = predicted * 0.08
        if diff < -thr:    deal = "Excellent Deal"
        elif diff > thr:   deal = "Overpriced"

    return PredictResponse(
        predicted_price    = round(predicted, 0),
        health_score       = health,
        deal_rating        = deal,
        depreciation_curve = depr,
        bargain_price      = bargain,
        annual_fuel_cost   = fuel,
        annual_maintenance = maint,
        annual_insurance   = insur,
        annual_license     = license,
        model_used         = model_used,
    )


@app.post("/recommend", response_model=RecommendResponse)
def recommend_bikes(req: RecommendRequest):
    """
    Content-based recommendation engine.
    Returns up to 5 motorcycle recommendations tailored to buyer profile.
    """
    CATALOG = [
        # (brand, model, cc, style, fuel_economy, avg_price_new)
        ("Honda",  "Dio",      110, "scooter",  60, 280000),
        ("Honda",  "CB Shine", 125, "commute",  52, 310000),
        ("Honda",  "CB Unicorn",150,"commute",  48, 380000),
        ("Honda",  "Hornet",   160, "sport",    42, 510000),
        ("Yamaha", "FZ",       149, "sport",    45, 500000),
        ("Yamaha", "R15",      155, "sport",    40, 650000),
        ("Yamaha", "MT15",     155, "sport",    40, 680000),
        ("Yamaha", "Saluto",   125, "commute",  60, 270000),
        ("Bajaj",  "Pulsar",   150, "sport",    45, 420000),
        ("Bajaj",  "CT100",    100, "commute",  65, 195000),
        ("Bajaj",  "Platina",  110, "commute",  70, 220000),
        ("Suzuki", "Gixxer",   155, "sport",    42, 490000),
        ("TVS",    "Apache",   160, "sport",    40, 520000),
        ("TVS",    "Jupiter",  110, "scooter",  55, 290000),
        ("KTM",    "Duke 200", 200, "sport",    30, 850000),
        ("Hero",   "Splendor", 100, "commute",  65, 210000),
    ]

    usage = req.UsageType.lower()
    budget_factor = 1.20  # used bikes ~20% below brand new

    results = []
    for brand, model, cc, style, fuel_eco, price_new in CATALOG:
        est_price = price_new / budget_factor

        # Budget filter
        if est_price > req.Budget * 1.05:
            continue
        if req.MaxCC and cc > req.MaxCC:
            continue

        # Scoring (cosine-like weighted)
        score = 100.0

        # Usage alignment
        if usage == "commute" and style in ("commute", "scooter"): score += 25
        elif usage == "sport"  and style == "sport":               score += 25
        elif usage == "travel" and cc >= 150:                      score += 20

        # Mileage priority
        mp = req.MileagePriority.lower()
        if mp == "high"   and fuel_eco >= 55: score += 15
        elif mp == "medium" and fuel_eco >= 45: score += 8
        elif mp == "low"    and fuel_eco < 45:  score += 5

        # Brand preference
        if req.PreferredBrand and brand.lower() == req.PreferredBrand.lower():
            score += 20

        # Budget proximity bonus (closer to budget = better)
        budget_ratio = est_price / req.Budget
        if 0.6 <= budget_ratio <= 0.9:  score += 10
        elif budget_ratio < 0.6:        score -= 5

        # Build reason string
        reason_parts = []
        if style in ("commute", "scooter") and usage == "commute":
            reason_parts.append("ideal city commuter")
        elif style == "sport" and usage == "sport":
            reason_parts.append("sport-oriented ride")
        if fuel_eco >= 55:
            reason_parts.append(f"excellent {fuel_eco}km/L fuel economy")
        elif fuel_eco >= 45:
            reason_parts.append(f"good {fuel_eco}km/L efficiency")
        if cc <= 125:
            reason_parts.append("low maintenance cost")
        reason = ", ".join(reason_parts) if reason_parts else "balanced everyday option"

        results.append(RecommendedBike(
            brand           = brand,
            model           = model,
            year_range      = "2019–2023",
            cc              = cc,
            score           = round(score, 1),
            reason          = reason.capitalize(),
            estimated_price = round(est_price, 0)
        ))

    # Sort by score descending, return top 5
    results.sort(key=lambda r: r.score, reverse=True)
    top5 = results[:5]

    if not top5:
        raise HTTPException(status_code=404, detail="No matching bikes found for the given criteria.")

    return RecommendResponse(
        recommendations = top5,
        budget          = req.Budget,
        usage_profile   = req.UsageType,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
