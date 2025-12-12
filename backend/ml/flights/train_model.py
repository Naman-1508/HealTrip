import pandas as pd
import numpy as np
import pickle
import os
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Define paths
# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'airlines_flights_data.csv')
MODELS_DIR = BASE_DIR

os.makedirs(MODELS_DIR, exist_ok=True)

def load_and_clean_data():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Data file not found at {DATA_PATH}")
    
    df = pd.read_csv(DATA_PATH)
    
    # Standardize column names (strip whitespace, title case)
    df.columns = [col.strip().title() for col in df.columns]
    
    # Rename specifically if needed to match requirements exactly
    # Assuming columns might be like 'Airline', 'Date_of_Journey', 'Source', 'Destination', 'Route', 'Dep_Time', 'Arrival_Time', 'Duration', 'Total_Stops', 'Additional_Info', 'Price'
    # The user request asks to standardize: Origin, Destination, Price, Airline, Duration, Stops
    # Let's map common names if they differ, or ensure we have them.
    # For now, let's assume the CSV has these loosely.
    
    # Clean missing values
    df.dropna(inplace=True)
    
    # Standardize specific column names if they are different in the dataset
    # We will check and rename for consistency
    utils_rename = {
        'Source_City': 'Origin',
        'Source': 'Origin',
        'Destination_City': 'Destination',
        'Destination': 'Destination',
        'Total_Stops': 'Stops',
        'Stops': 'Stops'
    }
    # Only rename if columns exist
    relevant_rename = {k: v for k, v in utils_rename.items() if k in df.columns}
    df.rename(columns=relevant_rename, inplace=True)
    
    # Ensure required columns exist
    required_cols = ['Origin', 'Destination', 'Airline', 'Duration', 'Stops', 'Price']
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns after renaming: {missing}. Available: {df.columns.tolist()}")
    
    print(f"Data loaded and cleaned. Shape: {df.shape}")
    return df

def feature_engineering(df):
    print("Feature engineering...")
    
    # 1. duration_minutes
    def convert_duration(duration):
        # Format usually "2h 50m" or "19h"
        try:
            h = 0
            m = 0
            match_h = re.search(r'(\d+)h', str(duration))
            match_m = re.search(r'(\d+)m', str(duration))
            if match_h: h = int(match_h.group(1))
            if match_m: m = int(match_m.group(1))
            return h * 60 + m
        except:
            return 0

    df['duration_minutes'] = df['Duration'].apply(convert_duration)
    
    # 2. num_stops
    def convert_stops(stops):
        # Format "non-stop", "1 stop", "2 stops"
        if pd.isna(stops): return 0
        stops = str(stops).lower()
        if 'non-stop' in stops: return 0
        if '1 stop' in stops: return 1
        if '2 stop' in stops: return 2
        if '3 stop' in stops: return 3
        if '4 stop' in stops: return 4
        return 0

    df['num_stops'] = df['Stops'].apply(convert_stops)
    
    # 3. route_text (Origin + Destination + Airline)
    df['route_text'] = df['Origin'] + " " + df['Destination'] + " " + df['Airline']
    
    return df

def train_models(df):
    print("Training models...")
    
    encoders = {}
    
    # Encode Categorical Features
    categorical_cols = ['Airline', 'Origin', 'Destination']
    for col in categorical_cols:
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col])
        encoders[col] = le
        
    # Validating we have Price
    if 'Price' not in df.columns:
        raise ValueError("Price column missing from dataset")

    # --- 1. Flight Recommendation System (Content-Based) ---
    print("Building Recommendation Model...")
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['route_text'])
    
    # Calculate cosine similarity matrix
    # note: The full matrix (N*N) is too large for memory (OOM). 
    # We will use query-based similarity in the API using the tfidf_matrix.
    # similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    print("Skipping full similarity matrix computation to avoid OOM.")
    
    # --- 2. Flight Price Prediction Model ---
    print("Training Price Prediction Model...")
    X_price = df[['Airline_encoded', 'Origin_encoded', 'Destination_encoded', 'duration_minutes', 'num_stops']]
    y_price = df['Price']
    
    price_model = RandomForestRegressor(n_estimators=100, random_state=42)
    price_model.fit(X_price, y_price)
    
    # --- 3. Flight Route Clustering Model ---
    print("Trainnig Clustering Model...")
    # Scale features for clustering
    scaler = StandardScaler()
    cluster_features = df[['Price', 'duration_minutes', 'num_stops', 'Airline_encoded']]
    cluster_features_scaled = scaler.fit_transform(cluster_features)
    
    kmeans = KMeans(n_clusters=3, random_state=42) # Economy, Standard, Premium
    df['cluster_label'] = kmeans.fit_predict(cluster_features_scaled)
    
    # Map clusters to names based on average price
    cluster_centers = pd.DataFrame(scaler.inverse_transform(kmeans.cluster_centers_), columns=cluster_features.columns)
    # Sort clusters by Price to assign Economy < Standard < Premium
    sorted_clusters = cluster_centers.sort_values('Price')
    cluster_mapping = {} # cluster_id -> name
    names = ['Economy', 'Standard', 'Premium']
    for idx, (cluster_id, row) in enumerate(sorted_clusters.iterrows()):
        if idx < len(names):
            cluster_mapping[cluster_id] = names[idx]
        else:
            cluster_mapping[cluster_id] = names[-1]
            
    df['cluster_name'] = df['cluster_label'].map(cluster_mapping)
    
    # Save artifacts
    print("Saving models...")
    
    # Save everything needed for inference
    artifacts = {
        'encoders': encoders,
        'tfidf_vectorizer': tfidf,
        # 'similarity_matrix': similarity_matrix, # Removed due to OOM
        'price_model': price_model,
        'clustering_model': kmeans,
        'scaler': scaler,
        'cluster_mapping': cluster_mapping,
        'processed_data': df # Save processed data for recommendations to lookup original details
    }
    
    # Saving individually as requested or in a dict? 
    # User said: tfidf_vectorizer.pkl, similarity_matrix.pkl, flight_price_model.pkl, flight_cluster_model.pkl, encoders.pkl
    
    with open(os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl'), 'wb') as f:
        pickle.dump(tfidf, f)
        
    # with open(os.path.join(MODELS_DIR, 'similarity_matrix.pkl'), 'wb') as f:
    #     pickle.dump(similarity_matrix, f)

    with open(os.path.join(MODELS_DIR, 'tfidf_matrix.pkl'), 'wb') as f:
        pickle.dump(tfidf_matrix, f)
        
    with open(os.path.join(MODELS_DIR, 'flight_price_model.pkl'), 'wb') as f:
        pickle.dump(price_model, f)
        
    with open(os.path.join(MODELS_DIR, 'flight_cluster_model.pkl'), 'wb') as f:
        pickle.dump({'model': kmeans, 'scaler': scaler, 'mapping': cluster_mapping}, f)
        
    with open(os.path.join(MODELS_DIR, 'encoders.pkl'), 'wb') as f:
        pickle.dump(encoders, f)

    # Also save the processed dataframe for the ID lookup in API
    df.to_pickle(os.path.join(MODELS_DIR, 'processed_flights.pkl'))

    print("All models saved successfully.")

if __name__ == "__main__":
    df = load_and_clean_data()
    df = feature_engineering(df)
    train_models(df)
