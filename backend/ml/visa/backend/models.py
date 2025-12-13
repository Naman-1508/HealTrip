
from pydantic import BaseModel
from typing import List, Optional

class VisaQuery(BaseModel):
    country: str
    visa_type: Optional[str] = "tourist" # Default per requirements
    purpose: Optional[str] = None
    age: Optional[int] = None
    stay_duration: Optional[str] = None

class VisaResponse(BaseModel):
    country: str
    visa_type: str
    required_documents: List[str]
    financial_requirements: str
    eligibility_criteria: str
    processing_time: str
    special_notes: str
