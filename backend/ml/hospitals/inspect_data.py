import pickle
import pandas as pd

# Load the hospital data
with open("hospital_data.pkl", "rb") as f:
    df, tfidf_matrix = pickle.load(f)

print("DataFrame shape:", df.shape)
print("\nColumn names:")
print(df.columns.tolist())
print("\nFirst few rows:")
print(df.head())
print("\nData types:")
print(df.dtypes)
print("\nSample city values:")
if "City" in df.columns:
    print(df["City"].value_counts().head(10))
