import pandas as pd
import numpy as np
import pickle
import os
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../data")
MODELS_DIR = os.path.join(BASE_DIR, "../models")

os.makedirs(MODELS_DIR, exist_ok=True)


def load_data():
    print("Loading Yoga data...")
    path = os.path.join(DATA_DIR, "yoga_wellness_india_500.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing data file: {path}")
    return pd.read_csv(path)


def synthesize_yoga_features(df):
    """Generates Price, Amenities, Style, Focus if missing"""
    styles = ["Hatha", "Vinyasa", "Ashtanga", "Iyengar", "Kundalini", "Power Yoga"]
    focuses = [
        "Meditation",
        "Strength",
        "Flexibility",
        "Stress Relief",
        "Weight Loss",
        "Mindfulness",
    ]
    amenities_list = [
        "Mats",
        "Showers",
        "AC",
        "Parking",
        "Locker",
        "Juice Bar",
        "Spa",
        "Pool",
    ]

    def get_features(row):
        seed = hash(row["Center_Name"]) % 10000
        random.seed(seed)
        style = random.choice(styles)
        focus = random.choice(focuses)
        num_amenities = random.randint(1, 5)
        amenities = ",".join(random.sample(amenities_list, num_amenities))
        price = random.randint(3, 20) * 100
        return pd.Series([style, focus, amenities, price])

    if "Yoga_Style" not in df.columns:
        print("Synthesizing Yoga Features...")
        df[["Yoga_Style", "Session_Focus", "Amenities", "Price"]] = df.apply(
            get_features, axis=1
        )

    return df


def preprocess_yoga(df):
    print("Preprocessing Yoga Data...")
    df.columns = [c.strip().replace(" ", "_").title() for c in df.columns]
    df.fillna("", inplace=True)
    df = synthesize_yoga_features(df)
    df["Amenities_Count"] = df["Amenities"].apply(
        lambda x: len(x.split(",")) if x else 0
    )
    df["combined_text"] = (
        df.get("City", "")
        + " "
        + df.get("Yoga_Style", "")
        + " "
        + df.get("Session_Focus", "")
        + " "
        + df.get("Amenities", "")
    )
    return df


def train_and_save():
    df = load_data()
    df = preprocess_yoga(df)

    # 1. Recommendation
    print("Training Recommendation Model...")
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(df["combined_text"])

    with open(os.path.join(MODELS_DIR, "yoga_vectorizer.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
    with open(os.path.join(MODELS_DIR, "yoga_tfidf_matrix.pkl"), "wb") as f:
        pickle.dump(tfidf_matrix, f)

    # 2. Price Prediction
    print("Training Price Model...")
    le_city = LabelEncoder()
    df["City_Encoded"] = le_city.fit_transform(df["City"])

    le_style = LabelEncoder()
    df["Style_Encoded"] = le_style.fit_transform(df["Yoga_Style"])

    features = df[["City_Encoded", "Style_Encoded", "Amenities_Count"]]
    model_price = RandomForestRegressor(n_estimators=50, random_state=42)
    model_price.fit(features, df["Price"])

    with open(os.path.join(MODELS_DIR, "yoga_price_model.pkl"), "wb") as f:
        pickle.dump(model_price, f)

    # 3. Clustering
    print("Training Clustering Model...")
    scaler = StandardScaler()
    features_cluster = scaler.fit_transform(df[["Price", "Amenities_Count"]])
    kmeans = KMeans(n_clusters=3, random_state=42)
    df["Cluster"] = kmeans.fit_predict(features_cluster)

    cluster_avg = df.groupby("Cluster")["Price"].mean().sort_values()
    cluster_names = {}
    names = ["Affordable", "Standard", "Premium"]
    for i, cluster_id in enumerate(cluster_avg.index):
        cluster_names[cluster_id] = names[min(i, len(names) - 1)]

    df["Cluster_Name"] = df["Cluster"].map(cluster_names)

    with open(os.path.join(MODELS_DIR, "yoga_clustering_model.pkl"), "wb") as f:
        pickle.dump({"model": kmeans, "scaler": scaler, "names": cluster_names}, f)

    # Save Encoders
    encoders = {"yoga_encoders": {"city": le_city, "style": le_style}}
    with open(os.path.join(MODELS_DIR, "encoders.pkl"), "wb") as f:
        pickle.dump(encoders, f)

    df.to_pickle(os.path.join(MODELS_DIR, "yoga_df.pkl"))
    print("Yoga Models Trained & Saved.")


if __name__ == "__main__":
    train_and_save()
