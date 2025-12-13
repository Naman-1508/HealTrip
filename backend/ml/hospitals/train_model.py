import pandas as pd
import pickle
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Paths
# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "hospitals_1000.csv")
MODELS_DIR = BASE_DIR


def train_and_save():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)

    # 1. Data Cleaning
    print("Cleaning data...")
    # Fill missing rating with mean or 0
    df["Rating_5_Scale"] = pd.to_numeric(df["Rating_5_Scale"], errors="coerce").fillna(
        0
    )

    # Mock Review Count (Requirement says 30% weight, but column missing)
    # Generate random review counts between 50 and 500 for demonstration
    np.random.seed(42)  # For reproducibility
    df["Review_Count"] = np.random.randint(50, 501, size=len(df))

    # Ensure Review Summary is string
    df["Review_Summary"] = df["Review_Summary"].fillna("").astype(str)

    # 2. Vectorization
    print("Vectorizing text...")
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df["Review_Summary"])

    # 3. Save Artifacts
    print(f"Saving models to {MODELS_DIR}...")

    # Save the vectorizer
    with open(os.path.join(MODELS_DIR, "disease_vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)

    # Save the processed dataframe with vectors (optional, or just reuse df in runtime)
    # We will save the DF to avoid re-processing at runtime.
    # We won't save the tfidf_matrix directly as sparse matrix, but we can re-compute it or save it.
    # For simplicity, we'll save the DF and re-transform query at runtime,
    # or we can save the matrix for cosine similarity if we wanted to find similar hospitals based on summary alone.
    # But for "Text Similarity between disease and summary", we need to run vectorizer on query(disease) and compare to summaries.
    # So we need the matrix.

    with open(os.path.join(MODELS_DIR, "hospital_data.pkl"), "wb") as f:
        # Saving tuple of dataframe and the massive matrix
        pickle.dump((df, tfidf_matrix), f)

    print("Training complete.")


if __name__ == "__main__":
    train_and_save()
