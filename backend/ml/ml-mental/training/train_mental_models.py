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
    print("Loading Mental Health data...")
    path = os.path.join(DATA_DIR, "mental_health_sessions_india_500.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing data file: {path}")
    return pd.read_csv(path)


def synthesize_mental_features(df):
    """Generates Fee, Topics, Type if missing"""
    types = ["Workshop", "Group Therapy", "One-on-One", "Seminar", "Retreat"]
    topics_list = [
        "Anxiety",
        "Depression",
        "Stress",
        "Relationships",
        "Trauma",
        "Career",
        "Addiction",
    ]
    amenities_list = [
        "Private Room",
        "Online Option",
        "Refreshments",
        "Wheelchair Access",
        "Insurance Accepted",
    ]

    def get_features(row):
        seed = hash(row["Session_Name"]) % 10000
        random.seed(seed)
        sType = random.choice(types)
        num_topics = random.randint(1, 3)
        topics = ",".join(random.sample(topics_list, num_topics))
        num_amenities = random.randint(1, 4)
        amenities = ",".join(random.sample(amenities_list, num_amenities))
        fee = random.randint(5, 50) * 100
        return pd.Series([sType, topics, amenities, fee])

    if "Session_Type" not in df.columns:
        print("Synthesizing Mental Health Features...")
        df[["Session_Type", "Topics_Covered", "Amenities", "Fee"]] = df.apply(
            get_features, axis=1
        )
    return df


def preprocess_mental(df):
    print("Preprocessing Mental Health Data...")
    df.columns = [c.strip().replace(" ", "_").title() for c in df.columns]
    df.fillna("", inplace=True)
    df = synthesize_mental_features(df)
    df["Amenities_Count"] = df["Amenities"].apply(
        lambda x: len(x.split(",")) if x else 0
    )
    df["Topics_Count"] = df["Topics_Covered"].apply(
        lambda x: len(x.split(",")) if x else 0
    )
    df["combined_text"] = (
        df.get("City", "")
        + " "
        + df.get("Session_Type", "")
        + " "
        + df.get("Topics_Covered", "")
        + " "
        + df.get("Amenities", "")
    )
    return df


def train_and_save():
    df = load_data()
    df = preprocess_mental(df)

    # 1. Recommendation
    print("Training Recommendation Model...")
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(df["combined_text"])

    with open(os.path.join(MODELS_DIR, "mental_vectorizer.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
    with open(os.path.join(MODELS_DIR, "mental_tfidf_matrix.pkl"), "wb") as f:
        pickle.dump(tfidf_matrix, f)

    # 2. Fee Prediction
    print("Training Fee Model...")
    le_city = LabelEncoder()
    df["City_Encoded"] = le_city.fit_transform(df["City"])

    le_type = LabelEncoder()
    df["Type_Encoded"] = le_type.fit_transform(df["Session_Type"])

    features = df[["City_Encoded", "Type_Encoded", "Amenities_Count", "Topics_Count"]]
    model_fee = RandomForestRegressor(n_estimators=50, random_state=42)
    model_fee.fit(features, df["Fee"])

    with open(os.path.join(MODELS_DIR, "mental_price_model.pkl"), "wb") as f:
        pickle.dump(model_fee, f)

    # 3. Clustering
    print("Training Clustering Model...")
    scaler = StandardScaler()
    features_cluster = scaler.fit_transform(
        df[["Fee", "Amenities_Count", "Topics_Count"]]
    )
    kmeans = KMeans(n_clusters=3, random_state=42)
    df["Cluster"] = kmeans.fit_predict(features_cluster)

    cluster_avg = df.groupby("Cluster")["Fee"].mean().sort_values()
    cluster_names = {}
    names = ["Community/Free", "Standard", "Premium"]
    for i, cluster_id in enumerate(cluster_avg.index):
        cluster_names[cluster_id] = names[min(i, len(names) - 1)]

    df["Cluster_Name"] = df["Cluster"].map(cluster_names)

    with open(os.path.join(MODELS_DIR, "mental_clustering_model.pkl"), "wb") as f:
        pickle.dump({"model": kmeans, "scaler": scaler, "names": cluster_names}, f)

    # Save Encoders
    encoders = {"mental_encoders": {"city": le_city, "type": le_type}}
    with open(os.path.join(MODELS_DIR, "encoders.pkl"), "wb") as f:
        pickle.dump(encoders, f)

    df.to_pickle(os.path.join(MODELS_DIR, "mental_df.pkl"))
    print("Mental Health Models Trained & Saved.")


if __name__ == "__main__":
    train_and_save()
