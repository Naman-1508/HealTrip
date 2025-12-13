from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
import os

app = FastAPI(title="HealTrip ML Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Artifacts
print("Loading ML Artifacts...")
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    rf_model = joblib.load(os.path.join(MODEL_DIR, "hotel_price_model.pkl"))
    le = joblib.load(os.path.join(MODEL_DIR, "location_encoder.pkl"))
    tfidf = joblib.load(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"))
    tfidf_matrix = joblib.load(os.path.join(MODEL_DIR, "tfidf_matrix.pkl"))
    df = joblib.load(os.path.join(MODEL_DIR, "hotel_data_processed.pkl"))
    print("Artifacts loaded successfully.")
except Exception as e:
    print(f"Error loading artifacts: {e}")
    print("Ensure you ran train_model.py first!")


# Request Models
class PricePredictionRequest(BaseModel):
    hotel_rating: float
    amenities_count: int
    city: str


@app.get("/")
def home():
    return {"message": "HealTrip ML Service is Running"}


@app.get("/recommend")
def recommend_hotels(
    location: str = Query(..., description="City name e.g. Mumbai"),
    budget: float = Query(None, description="Max budget per night"),
    stars: float = Query(None, description="Minimum star rating"),
    query: str = Query(None, description="Free text query e.g. 'pool and spa'"),
):
    """
    Recommend hotels based on location, filters, and content similarity.
    """
    # City name normalization mapping
    city_mapping = {
        "bangalore": "bengaluru",
        "bengaluru": "bengaluru",
        "bombay": "mumbai",
        "mumbai": "mumbai",
        "new delhi": "delhi",
        "delhi": "delhi",
        "kolkata": "kolkata",
        "calcutta": "kolkata",
        "chennai": "chennai",
        "madras": "chennai",
        "hyderabad": "hyderabad",
        "thiruvananthapuram": "thiruvananthapuram",
        "trivandrum": "thiruvananthapuram",
        "kochi": "kochi",
        "cochin": "kochi",
        "goa": "goa",
        "ahmedabad": "ahmedabad",
        "pune": "pune",
    }

    location_lower = location.lower().strip()

    # Try to find a known city in the input string
    normalized_location = location_lower  # distinct default

    found_city = False
    for k, v in city_mapping.items():
        if k in location_lower:
            normalized_location = v
            found_city = True
            break

    if not found_city:
        # Fallback to original logic if no city found
        normalized_location = location_lower

    # 1. Base Filter (Location is mandatory)
    filtered_df = df[
        df["City"].str.lower().str.contains(normalized_location, na=False)
    ].copy()

    if filtered_df.empty:
        return {"count": 0, "results": [], "message": f"No hotels found in {location}"}

    # 2. Apply Budget & Star Filters
    if budget:
        filtered_df = filtered_df[filtered_df["Hotel_Price"] <= budget]
    if stars:
        filtered_df = filtered_df[filtered_df["Hotel_Rating"] >= stars]

    if filtered_df.empty:
        return {
            "count": 0,
            "results": [],
            "message": "No hotels match your budget/star criteria.",
        }

    # 3. Content-Based Sorting (if query provided)
    if query:
        # Transform query to vector
        query_vec = tfidf.transform([query + " " + normalized_location])

        # Calculate similarity ONLY for the filtered subset
        # We need to rely on original indices to map back to tfidf_matrix
        # But tfidf_matrix is for entire DF.
        # Strategy: Get indices of filtered_df, extract clean rows from matrix

        subset_indices = filtered_df.index
        # Using a loop or mapped helper might be slow for huge data,
        # but for <5000 rows it's fine to re-compute or slice.
        # Slicing sparse matrix:
        subset_tfidf = tfidf_matrix[subset_indices]

        cosine_sim = cosine_similarity(query_vec, subset_tfidf).flatten()
        filtered_df["similarity"] = cosine_sim

        # Sort by similarity
        results = filtered_df.sort_values(by="similarity", ascending=False)
    else:
        # Default sort: Rating then Price
        results = filtered_df.sort_values(
            by=["Hotel_Rating", "Hotel_Price"], ascending=[False, True]
        )

    # Convert to list of dicts
    top_results = results.head(20).fillna("").to_dict(orient="records")

    return {"count": len(top_results), "city": location, "results": top_results}


@app.post("/predict-price")
def predict_price(req: PricePredictionRequest):
    """
    Predict hotel price based on features.
    """
    try:
        # Encode City
        try:
            loc_encoded = le.transform([req.city.lower().strip()])[0]
        except ValueError:
            # Handle unknown city - use median or mode city code
            loc_encoded = le.transform([le.classes_[0]])[0]

        # Prepare Feature Vector
        # Order: ['Hotel_Rating', 'amenities_count', 'Location_Encoded']
        features = np.array([[req.hotel_rating, req.amenities_count, loc_encoded]])

        predicted_price = rf_model.predict(features)[0]

        return {
            "predicted_price": round(predicted_price, 2),
            "currency": "INR",
            "metadata": req.dict(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
