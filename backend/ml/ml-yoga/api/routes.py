from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "../models")

models = {}
data = {}


def load_models():
    print("Loading Yoga Models...")
    try:
        with open(os.path.join(MODELS_DIR, "yoga_vectorizer.pkl"), "rb") as f:
            models["vec"] = pickle.load(f)
        with open(os.path.join(MODELS_DIR, "yoga_tfidf_matrix.pkl"), "rb") as f:
            models["mat"] = pickle.load(f)
        with open(os.path.join(MODELS_DIR, "yoga_price_model.pkl"), "rb") as f:
            models["price"] = pickle.load(f)
        with open(os.path.join(MODELS_DIR, "encoders.pkl"), "rb") as f:
            models["encoders"] = pickle.load(f)
        data["yoga"] = pd.read_pickle(os.path.join(MODELS_DIR, "yoga_df.pkl"))
        print("Yoga Models loaded.")
    except Exception as e:
        print(f"Error loading yoga models: {e}")


class YogaPriceRequest(BaseModel):
    city: str
    yoga_style: str
    amenities_count: int


def safe_transform(le, val):
    try:
        if val in le.classes_:
            return le.transform([val])[0]
        return 0
    except:
        return 0


@router.on_event("startup")
async def startup():
    load_models()


@router.get("/sessions/yoga")
def get_yoga():
    if "yoga" not in data:
        raise HTTPException(503, "Not loaded")
    return data["yoga"].replace({np.nan: None}).head(50).to_dict(orient="records")


@router.get("/recommend/yoga")
def rec_yoga(city: str, focus: str, budget: float = None):
    if "yoga" not in data:
        raise HTTPException(503, "Not loaded")
    q = f"{city} {focus}"
    vec = models["vec"].transform([q])
    sim = cosine_similarity(vec, models["mat"]).flatten()
    df = data["yoga"].copy()
    df["sim"] = sim
    if budget:
        df = df[df["Price"] <= budget]
    return (
        df.sort_values(by=["sim", "Price"], ascending=[False, True])
        .head(10)
        .replace({np.nan: None})
        .to_dict(orient="records")
    )


@router.post("/predict-price/yoga")
def pred_yoga(req: YogaPriceRequest):
    if "price" not in models:
        raise HTTPException(503, "Not loaded")
    enc = models["encoders"]["yoga_encoders"]
    price = models["price"].predict(
        [
            [
                safe_transform(enc["city"], req.city),
                safe_transform(enc["style"], req.yoga_style),
                req.amenities_count,
            ]
        ]
    )[0]
    return {"predicted_price": round(price, 2)}


@router.get("/cluster-info/yoga")
def get_yoga_cluster(session_title: str):
    if "yoga" not in data:
        raise HTTPException(503, "Not loaded")
    match = data["yoga"][
        data["yoga"]["Center_Name"].str.contains(session_title, case=False, na=False)
    ]
    if match.empty:
        raise HTTPException(404, "Not found")
    item = match.iloc[0]
    return {"center": item["Center_Name"], "cluster": item["Cluster_Name"]}
