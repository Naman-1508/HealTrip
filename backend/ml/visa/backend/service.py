
from typing import List
from db import get_country_data
from models import VisaQuery, VisaResponse

def process_visa_query(query: VisaQuery) -> VisaResponse:
    country_name = query.country.strip()
    data = get_country_data(country_name)

    if not data:
        # Schema rule 2: "Data not available for this country in the dataset."
        return VisaResponse(
            country=country_name,
            visa_type=query.visa_type or "Unknown",
            required_documents=[],
            financial_requirements="Data not available for this country in the dataset.",
            eligibility_criteria="Data not available for this country in the dataset.",
            processing_time="Data not available for this country in the dataset.",
            special_notes="Data not available for this country in the dataset."
        )

    # Map CSV fields to Response
    # CSV Columns: Country, Passport_Validity, Required_Documents, Additional_Notes
    
    # Required Documents parsing
    req_docs_raw = data.get("Required_Documents", "")
    req_docs_list = [d.strip() for d in req_docs_raw.split(',') if d.strip()]

    # Special Notes mapping
    notes = data.get("Additional_Notes", "")
    if data.get("Passport_Validity"):
        notes += f" (Passport validity: {data.get('Passport_Validity')})"

    return VisaResponse(
        country=data.get("Country", country_name),
        visa_type=query.visa_type, # Echo back or default
        required_documents=req_docs_list,
        # Missing columns in CSV -> "Data not available"
        financial_requirements="Data not available in dataset.",
        eligibility_criteria="Data not available in dataset.", 
        processing_time="Data not available in dataset.",
        special_notes=notes or "None"
    )
