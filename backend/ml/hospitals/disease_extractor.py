import re
import io
import pypdf
from typing import Optional, Tuple
from disease_mapping import DISEASE_SPECIALTY_MAP

class DiseaseExtractor:
    def __init__(self):
        self.known_diseases = list(DISEASE_SPECIALTY_MAP.keys())

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text

    def extract_disease(self, text: str) -> dict:
        """
        Extracts disease with a confidence score.
        Returns {'disease': str, 'confidence': float}
        """
        text_lower = text.lower()
        
        # 1. Rule-based extraction (Regex)
        # Looking for patterns like "Diagnosis: X", "Impression: X", "Condition: X"
        patterns = [
            r"diagnosis\s*[:\-]\s*([a-z\s]+)",
            r"impression\s*[:\-]\s*([a-z\s]+)",
            r"condition\s*[:\-]\s*([a-z\s]+)",
            r"suffering from\s*([a-z\s]+)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                extracted = match.group(1).strip().split('\n')[0]
                # Cleanup common punctuations
                extracted = re.sub(r'[.,]', '', extracted).strip()
                
                # Verify if it looks like a disease or check against known mapping 
                # (For MVP, we give it high confidence if it was explicitly stated)
                if len(extracted) > 3:
                     return {"disease": extracted.title(), "confidence": 0.95}

        # 2. Keyword matching (TF-IDF equivalent simplified for MVP w/o heavy model load)
        # Check if any known disease from our map exists in the text
        # Prioritize longer matches to avoid partials (e.g. "cancer" vs "lung cancer")
        
        sorted_diseases = sorted(self.known_diseases, key=len, reverse=True)
        
        for disease in sorted_diseases:
            if disease in text_lower:
                return {"disease": disease.title(), "confidence": 0.85}
        
        return {"disease": "Unknown", "confidence": 0.0}
