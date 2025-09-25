from pathlib import Path
from typing import List, Optional, Dict, Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, Body
from pydantic import BaseModel
from datetime import timedelta

# ML imports
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.exceptions import NotFittedError

try:
    from xgboost import XGBClassifier  # optional
    HAS_XGB = True
except Exception:
    HAS_XGB = False

# Prophet import (package name is 'prophet' as of latest versions)
try:
    from prophet import Prophet
except Exception:  # pragma: no cover - allows app to start even if prophet is missing at dev time
    Prophet = None  # type: ignore

app = FastAPI(title="ML Service", version="1.0.0")

ROOT_DIR = Path(__file__).resolve().parents[1]
DATASETS_DIR = ROOT_DIR / "datasets"
# Prefer datasets colocated with this service, with fallback to project root datasets
ML_DATASETS_DIR = Path(__file__).resolve().parent / "datasets"

def dataset_path(filename: str) -> Path:
    cand1 = ML_DATASETS_DIR / filename
    if cand1.exists():
        return cand1
    return DATASETS_DIR / filename


class ForecastRow(BaseModel):
    ds: str
    y: float


class ElasticityRow(BaseModel):
    price: float
    units: float


class MarketingRow(BaseModel):
    date: str
    channel: str
    spend: float
    impressions: float
    clicks: float
    conversions: float


@app.get("/")
def read_root() -> Dict[str, Any]:
    return {"status": "ok", "service": "ml-service"}


@app.post("/forecast")
def forecast_endpoint(data: Optional[Dict[str, List[Any]]] = Body(default=None)) -> Dict[str, Any]:
    """
    Train Prophet on provided data or datasets/forecast.csv if empty.
    Return next 6 months daily forecast with P50 (yhat) and P90 (yhat_upper at 90% interval).
    Expected input JSON: { ds: [dates], y: [values] }
    """
    # Load data
    if data and isinstance(data, dict) and ("ds" in data and "y" in data):
        df = pd.DataFrame({"ds": data["ds"], "y": data["y"]})
    else:
        csv_path = dataset_path("forecast.csv")
        if not csv_path.exists():
            return {"error": f"Dataset not found at {csv_path}"}
        df = pd.read_csv(csv_path)

    # Validate required columns
    if not {"ds", "y"}.issubset(df.columns):
        return {"error": "Input must contain 'ds' and 'y' columns"}

    # Prophet may be optional at dev time
    if Prophet is None:
        return {"error": "Prophet is not installed. Please install 'prophet' to enable forecasting."}

    # Train Prophet and forecast ~6 months ahead (approx 180 days)
    try:
        m = Prophet(interval_width=0.9)
        m.fit(df)
        # Detect frequency; default to daily
        periods = 180
        future = m.make_future_dataframe(periods=periods, freq='D')
        forecast_df = m.predict(future)
        # Only return the future period
        result = forecast_df.tail(periods)[["ds", "yhat", "yhat_upper"]]
        return {
            "source": "body" if data else str(csv_path),
            "forecast": result.rename(columns={"yhat": "p50", "yhat_upper": "p90"}).to_dict(orient="records"),
        }
    except Exception as e:  # pragma: no cover
        return {"error": f"Forecasting failed: {e}"}


@app.post("/elasticity")
def elasticity_endpoint(data: Optional[Dict[str, List[float]]] = Body(default=None)) -> Dict[str, Any]:
    """
    If no input provided, load datasets/price_sales.csv and calculate elasticity coefficient
    using log-linear regression (scikit-learn): ln(units) = a + b * ln(price). Elasticity is b.
    """
    # Load data
    if data and isinstance(data, dict) and ("price" in data and "units" in data):
        df = pd.DataFrame({"price": data["price"], "units": data["units"]})
    else:
        csv_path = dataset_path("price_sales.csv")
        if not csv_path.exists():
            return {"error": f"Dataset not found at {csv_path}"}
        df = pd.read_csv(csv_path)

    # Validate
    if not {"price", "units"}.issubset(df.columns):
        return {"error": "Input must contain 'price' and 'units' columns"}

    # Filter out non-positive values to avoid log issues
    df = df[(df["price"] > 0) & (df["units"] > 0)].copy()
    if df.empty:
        return {"error": "No positive price/units rows to compute elasticity"}

    # Log transform
    X = np.log(df[["price"]]).values.reshape(-1, 1)
    y = np.log(df["units"]).values.reshape(-1, 1)
    lr = LinearRegression()
    lr.fit(X, y)
    elasticity = float(lr.coef_.ravel()[0])
    intercept = float(lr.intercept_.ravel()[0])

    return {
        "source": "body" if data else str(csv_path),
        "elasticity": elasticity,
        "intercept": intercept,
    }


@app.post("/roi")
def roi_endpoint(data: Optional[Dict[str, List[float]]] = Body(default=None)) -> Dict[str, Any]:
    """
    If no input provided, load datasets/marketing.csv and compute conversion probability model.
    Prefer scikit-learn LogisticRegression; if XGBoost available, can be used instead.
    Expected input JSON: { spend: [..], conversions: [..] }
    Output: predicted conversion probability curve and simple ROI estimate across observed spend.
    """
    # Load
    if data and isinstance(data, dict) and ("spend" in data and "conversions" in data):
        df = pd.DataFrame({"spend": data["spend"], "conversions": data["conversions"]})
    else:
        csv_path = dataset_path("marketing.csv")
        if not csv_path.exists():
            return {"error": f"Dataset not found at {csv_path}"}
        df = pd.read_csv(csv_path)

    # Normalize schema: if dataset has more columns (legacy), aggregate
    if {"spend", "conversions"}.issubset(df.columns):
        used = df[["spend", "conversions"]].copy()
    elif {"clicks", "conversions", "spend"}.issubset(df.columns):
        used = df[["spend", "conversions"]].copy()
    else:
        return {"error": "Input must contain 'spend' and 'conversions' columns"}

    # Build target as binary conversion rate proxy: conv_rate = conversions / max(conversions)
    # For logistic suitability we binarize using median threshold
    conv_rate = used["conversions"].astype(float)
    if conv_rate.max() == 0:
        return {"error": "No conversions to model"}
    X = used[["spend"]].astype(float).values
    # Create a binary target by thresholding conversions at median
    thresh = float(conv_rate.median())
    y_bin = (conv_rate >= thresh).astype(int).values

    # Train classifier
    model = None
    try:
        if HAS_XGB:
            model = XGBClassifier(max_depth=3, n_estimators=50, learning_rate=0.1, subsample=0.9, colsample_bytree=0.9, reg_lambda=1.0)
            model.fit(X, y_bin)
        else:
            model = LogisticRegression()
            model.fit(X, y_bin)
    except Exception as e:  # pragma: no cover
        return {"error": f"Training ROI model failed: {e}"}

    # Predict probabilities across observed spend grid
    grid = np.linspace(float(used["spend"].min()), float(used["spend"].max()), num=min(50, len(used)))
    try:
        proba = model.predict_proba(grid.reshape(-1, 1))[:, 1]  # type: ignore[attr-defined]
    except Exception:
        # Fall back if model lacks predict_proba
        scores = model.decision_function(grid.reshape(-1, 1))  # type: ignore[attr-defined]
        # Sigmoid
        proba = 1.0 / (1.0 + np.exp(-scores))

    # Simple ROI estimate: ROI = conversions / spend (use expected conversions proxy = proba * max_conversions)
    max_conv = float(conv_rate.max())
    expected_conv = proba * max_conv
    roi = np.divide(expected_conv, grid, out=np.zeros_like(expected_conv), where=grid != 0)

    return {
        "probability_curve": [{"spend": float(s), "p_conv": float(p), "roi": float(r)} for s, p, r in zip(grid, proba, roi)],
        "threshold": thresh,
    }


@app.post("/simulate")
def simulate_endpoint(payload: Optional[Dict[str, float]] = Body(default=None)) -> Dict[str, Any]:
    """
    Monte Carlo simulation over 1000 draws using baseline units distribution inferred from price_sales.csv.
    Input JSON: { price: number, cost: number, marketing_spend: number }
    Output: percentile stats for revenue, expenses, profit.
    """
    if payload is None:
        payload = {}
    price = float(payload.get("price", 0))
    cost = float(payload.get("cost", 0))
    marketing_spend = float(payload.get("marketing_spend", 0))

    try:
        ps = pd.read_csv(dataset_path("price_sales.csv"))
        units_series = ps["units"].astype(float)
        units_mu = float(units_series.mean())
        units_sigma = float(units_series.std(ddof=1) or 1.0)
    except Exception:
        units_mu, units_sigma = 100.0, 20.0

    rng = np.random.default_rng(seed=42)
    draws = 1000
    units_sim = rng.normal(loc=units_mu, scale=units_sigma, size=draws)
    units_sim = np.clip(units_sim, a_min=0.0, a_max=None)

    revenue = price * units_sim
    expenses = cost + marketing_spend
    profit = revenue - expenses

    def pct(a, p):
        return float(np.percentile(a, p))

    return {
        "revenue": {"p10": pct(revenue, 10), "p50": pct(revenue, 50), "p90": pct(revenue, 90)},
        "expenses": {"p10": pct(expenses, 10), "p50": pct(expenses, 50), "p90": pct(expenses, 90)},
        "profit": {"p10": pct(profit, 10), "p50": pct(profit, 50), "p90": pct(profit, 90)},
    }


@app.post("/analyze")
def analyze_endpoint() -> Dict[str, Any]:
    """
    Combine: 6-month forecast (P50/P90), elasticity via log-linear regression, ROI probability curve, and Monte Carlo simulation.
    """
    # Forecast
    try:
        f_part = forecast_endpoint(None)
    except Exception as e:
        f_part = {"error": f"Forecast failed: {e}"}

    # Elasticity
    try:
        e_part = elasticity_endpoint(None)
    except Exception as e:
        e_part = {"error": f"Elasticity failed: {e}"}

    # ROI
    try:
        r_part = roi_endpoint(None)
    except Exception as e:
        r_part = {"error": f"ROI failed: {e}"}

    # Simulation using baseline params from datasets
    try:
        price_df = pd.read_csv(dataset_path("price_sales.csv"))
        price = float(price_df["price"].mean())
    except Exception:
        price = 20.0
    try:
        mkt_df = pd.read_csv(dataset_path("marketing.csv"))
        m_spend = float(mkt_df.get("spend", pd.Series([100])).mean())
    except Exception:
        m_spend = 100.0
    # Assume cost as 60% of price for baseline
    cost = price * 0.6
    try:
        s_part = simulate_endpoint({"price": price, "cost": cost, "marketing_spend": m_spend})
    except Exception as e:
        s_part = {"error": f"Simulation failed: {e}"}

    return {
        "forecast": f_part,
        "elasticity": e_part,
        "roi": r_part,
        "simulation": s_part,
    }


# For local running: uvicorn main:app --reload
