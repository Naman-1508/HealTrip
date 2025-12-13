import csv
import os
from typing import Dict, List, Optional

# Path to the dataset - use relative path from current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "..", "data", "visa_required_document.csv")


def load_visa_data() -> Dict[str, Dict[str, str]]:
    """
    Loads the visa requirement data into a dictionary keyed by Country (lowercase).
    """
    data = {}
    if not os.path.exists(DATA_FILE):
        # Fallback or error if file missing
        print(f"Warning: {DATA_FILE} not found.")
        return data

    with open(DATA_FILE, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row.get("Country", "").strip()
            if country:
                data[country.lower()] = row
    return data


# Global cache
_VISA_DATA_CACHE = load_visa_data()


def get_country_data(country_name: str) -> Optional[Dict[str, str]]:
    return _VISA_DATA_CACHE.get(country_name.lower())
