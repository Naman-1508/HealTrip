
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def load_data():
    try:
        pkl_path = os.path.join(DATA_DIR, 'processed_flights.pkl')
        if os.path.exists(pkl_path):
            return pd.read_pickle(pkl_path)
        
        csv_path = os.path.join(DATA_DIR, 'international_flights_india_1000 (1).csv')
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            # Ensure price column exists or rename
            return df
    except Exception as e:
        print(f"Error loading data: {e}")
    return pd.DataFrame()

df = load_data()

airline_multipliers = {
    'Air India': 1.0, 'IndiGo': 0.9, 'Vistara': 1.2, 
    'SpiceJet': 0.85, 'GoAir': 0.85, 'Air Asia': 0.85,
    'Emirates': 1.5, 'Lufthansa': 1.4, 'British Airways': 1.45,
    'Singapore Airlines': 1.5, 'Thai Airways': 1.2,
    'Etihad': 1.4, 'Qatar Airways': 1.5
}

stops_map = {'zero': 0, 'one': 1, 'two_or_more': 2}

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Flights ML Service"}

@app.get("/recommend-flights")
def recommend_flights(origin: str, destination: str):
    if df.empty:
        raise HTTPException(status_code=503, detail="Flight data not loaded")

    # Helper to safely get value
    def get_val(row, keys, default=None):
        for k in keys:
            if k in row.index and pd.notna(row[k]):
                return row[k]
        return default

    results = []
    
    # Process just first 10 rows for now (mock recommendation logic)
    for idx, row in df.head(10).iterrows():
        try:
            # 1. Extraction
            airline = str(get_val(row, ['airline', 'Airline'], 'IndiGo'))
            
            duration_val = get_val(row, ['duration', 'Duration', 'duration_minutes', 'Duration_Minutes'], 150)
            try:
                d_float = float(duration_val)
                if d_float < 48: # Hours
                    duration = int(d_float * 60)
                else: # Minutes
                    duration = int(d_float)
            except:
                duration = 150
            
            stops_val = get_val(row, ['stops', 'num_stops', 'Stops'], 'zero')
            stops = 0
            if isinstance(stops_val, str):
                stops = stops_map.get(stops_val.lower(), 0)
            else:
                try: stops = int(stops_val)
                except: stops = 0

            flight_origin = str(get_val(row, ['source_city', 'Origin', 'origin'], origin))
            flight_dest = str(get_val(row, ['destination_city', 'Destination', 'destination'], destination))
            
            dest_country = get_val(row, ['Destination_Country', 'destination_country'], '')
            flight_dest_full = f"{flight_dest}, {dest_country}" if dest_country else flight_dest

            # 2. Logic
            # 2. Logic
            # Only treat as international if destination keywords match or duration is EXTREMELY long (e.g. > 12 hours)
            # Domestic flights with stops can be 5-10 hours, so > 300 was too low.
            is_international = duration > 720 or any(c in flight_dest_full.lower() for c in ['dubai', 'london', 'york', 'paris', 'tokyo', 'canada', 'usa', 'uk', 'thailand', 'singapore', 'germany', 'france', 'australia', 'switzerland'])
            
            dataset_price = get_val(row, ['price', 'Price', 'Economy_Price_INR'], 0)
            try: dataset_price = float(dataset_price)
            except: dataset_price = 0
            
            final_price = 0
            
            # If dataset has valid price, use it but cap it for domestic if it seems insane
            if dataset_price > 2000:
                final_price = dataset_price
                # Sanity check for domestic
                if not is_international and final_price > 15000:
                    final_price = 4500 + (duration * 10) 
            else:
                # Calc formula
                rate = 100 if is_international else 12  # Lower domestic rate per min
                base_start = 15000 if is_international else 1800 # Lower domestic base
                
                if duration < 60: duration = 60
                final_price = base_start + (duration * rate)
                
                # Mults
                m1 = airline_multipliers.get(airline, 1.0)
                m2 = 1.0 + (stops * 0.1) # Reduced stops penalty
                final_price = final_price * m1 * m2
                
            # Floor
            min_p = 10000 if is_international else 2500
            if final_price < min_p: final_price = min_p + (int(idx) * 50)
            
            # 3. Format
            hours = duration // 60
            mins = duration % 60
            dur_fmt = f"{hours}h {mins}m"
            
            results.append({
                'airline': airline,
                'origin': flight_origin,
                'destination': flight_dest_full,
                'duration': dur_fmt,
                'duration_minutes': duration,
                'stops': stops,
                'price': round(final_price, 2)
            })
            
        except Exception as e:
            print(f"Row error: {e}")
            continue

    return results

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
