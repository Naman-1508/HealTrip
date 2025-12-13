from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '../models')

models = {}
data = {}

def load_models():
    print("Loading Mental Health Models...")
    try:
        with open(os.path.join(MODELS_DIR, 'mental_vectorizer.pkl'), 'rb') as f: models['vec'] = pickle.load(f)
        with open(os.path.join(MODELS_DIR, 'mental_tfidf_matrix.pkl'), 'rb') as f: models['mat'] = pickle.load(f)
        with open(os.path.join(MODELS_DIR, 'mental_price_model.pkl'), 'rb') as f: models['price'] = pickle.load(f)
        with open(os.path.join(MODELS_DIR, 'encoders.pkl'), 'rb') as f: models['encoders'] = pickle.load(f)
        data['mental'] = pd.read_pickle(os.path.join(MODELS_DIR, 'mental_df.pkl'))
        print("Mental Health Models loaded.")
    except Exception as e:
        print(f"Error loading mental models: {e}")

class MentalFeeRequest(BaseModel):
    city: str
    session_type: str
    amenities_count: int
    topics_count: int

def safe_transform(le, val):
    try:
        if val in le.classes_: return le.transform([val])[0]
        return 0
    except: return 0

@router.on_event("startup")
async def startup():
    load_models()

@router.get("/sessions/mental")
def get_mental():
    if 'mental' not in data: raise HTTPException(503, "Not loaded")
    return data['mental'].replace({np.nan: None}).head(50).to_dict(orient='records')

@router.get("/recommend/mental")
def rec_mental(city: str, type: str, budget: float = None):
    if 'mental' not in data: raise HTTPException(503, "Not loaded")
    q = f"{city} {type}"
    vec = models['vec'].transform([q])
    sim = cosine_similarity(vec, models['mat']).flatten()
    df = data['mental'].copy()
    df['sim'] = sim
    if budget: df = df[df['Fee'] <= budget]
    return df.sort_values(by=['sim', 'Fee'], ascending=[False, True]).head(10).replace({np.nan: None}).to_dict(orient='records')

@router.post("/predict-price/mental")
def pred_mental(req: MentalFeeRequest):
    if 'price' not in models: raise HTTPException(503, "Not loaded")
    enc = models['encoders']['mental_encoders']
    fee = models['price'].predict([[
        safe_transform(enc['city'], req.city),
        safe_transform(enc['type'], req.session_type),
        req.amenities_count,
        req.topics_count
    ]])[0]
    return {"predicted_fee": round(fee, 2)}

@router.get("/cluster-info/mental")
def get_mental_cluster(session_title: str):
    if 'mental' not in data: raise HTTPException(503, "Not loaded")
    match = data['mental'][data['mental']['Session_Name'].str.contains(session_title, case=False, na=False)]
    if match.empty: raise HTTPException(404, "Not found")
    item = match.iloc[0]
    return {"session": item['Session_Name'], "cluster": item['Cluster_Name']}
