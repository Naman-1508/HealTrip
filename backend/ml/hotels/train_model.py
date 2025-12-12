
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

# 1. LOAD DATA
DATA_PATH = "data/google_hotel_data_clean_v2.csv"
print(f"Loading data from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)

# 2. PREPROCESSING
print("Preprocessing data...")

# Combine features into single 'amenities' string
feature_cols = [f"Feature_{i}" for i in range(1, 10)]
df['amenities'] = df[feature_cols].fillna('').agg(' '.join, axis=1)

# Clean amenities text (lowercase, remove extra spaces)
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

df['amenities_clean'] = df['amenities'].apply(clean_text)

# Count amenities
df['amenities_count'] = df['amenities'].apply(lambda x: len(x.split()) if x else 0)

# clean city
df['City'] = df['City'].str.lower().str.strip()

# Encode Location
le = LabelEncoder()
df['Location_Encoded'] = le.fit_transform(df['City'])

# Handle missing ratings (fill with median)
df['Hotel_Rating'] = df['Hotel_Rating'].fillna(df['Hotel_Rating'].median())
df['Hotel_Price'] = pd.to_numeric(df['Hotel_Price'], errors='coerce').fillna(df['Hotel_Price'].median())

# 3. RECOMMENDATION ENGINE (TF-IDF)
print("Building recommendation engine...")
# Create a 'soup' of metadata for content-based filtering
df['metadata_soup'] = df['City'] + ' ' + df['amenities_clean'] + ' ' + df['Hotel_Rating'].astype(str) + ' star'

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['metadata_soup'])

# 4. PRICE PREDICTION MODEL
print("Training price prediction model...")
X = df[['Hotel_Rating', 'amenities_count', 'Location_Encoded']]
y = df['Hotel_Price']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

score = rf_model.score(X_test, y_test)
print(f"Model R^2 Score: {score:.4f}")

# 5. SAVE ARTIFACTS
print("Saving artifacts...")
joblib.dump(rf_model, "hotel_price_model.pkl")
joblib.dump(le, "location_encoder.pkl")
joblib.dump(tfidf, "tfidf_vectorizer.pkl")
joblib.dump(tfidf_matrix, "tfidf_matrix.pkl")
joblib.dump(df, "hotel_data_processed.pkl")

print("Done! Artifacts saved in backend/ml/")
