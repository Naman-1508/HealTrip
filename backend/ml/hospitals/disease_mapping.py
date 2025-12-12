import difflib

DISEASE_SPECIALTY_MAP = {
    # Cardiology
    "coronary artery disease": "Cardiology",
    "myocardial infarction": "Cardiology",
    "heart attack": "Cardiology",
    "arrhythmia": "Cardiology",
    "heart failure": "Cardiology",
    "atrial fibrillation": "Cardiology",
    "hypertension": "Cardiology",
    "hypertrophic cardiomyopathy": "Cardiology",

    # Neurology
    "stroke": "Neurology",
    "epilepsy": "Neurology",
    "migraine": "Neurology",
    "parkinson's disease": "Neurology",
    "alzheimer's disease": "Neurology",
    "multiple sclerosis": "Neurology",
    "brain tumor": "Neurology",

    # Oncology
    "breast cancer": "Oncology",
    "lung cancer": "Oncology",
    "leukemia": "Oncology",
    "lymphoma": "Oncology",
    "prostate cancer": "Oncology",
    "colorectal cancer": "Oncology",
    "skin cancer": "Oncology",

    # Gastroenterology
    "gerd": "Gastroenterology",
    "acid reflux": "Gastroenterology",
    "ibs": "Gastroenterology",
    "irritable bowel syndrome": "Gastroenterology",
    "crohn's disease": "Gastroenterology",
    "ulcerative colitis": "Gastroenterology",
    "liver cirrhosis": "Gastroenterology",
    "hepatitis": "Gastroenterology",

    # Orthopedics
    "osteoarthritis": "Orthopedics",
    "rheumatoid arthritis": "Orthopedics",
    "fracture": "Orthopedics",
    "scoliosis": "Orthopedics",
    "herniated disc": "Orthopedics",
    "acl tear": "Orthopedics",
    "osteoporosis": "Orthopedics",

    # Nephrology
    "kidney failure": "Nephrology",
    "chronic kidney disease": "Nephrology",
    "kidney stones": "Nephrology",
    "renal failure": "Nephrology",
    "glomerulonephritis": "Nephrology",
    
    # Endocrinology
    "diabetes": "Endocrinology",
    "hypothyroidism": "Endocrinology",
    "hyperthyroidism": "Endocrinology",
    "pcos": "Endocrinology",
    "pcod": "Endocrinology",
    "addison's disease": "Endocrinology",
    "cushing's syndrome": "Endocrinology",

    # Pediatrics
    "chickenpox": "Pediatrics",
    "measles": "Pediatrics",
    "mumps": "Pediatrics",
    "asthma": "Pediatrics", # can be others but common in kids
    "pneumonia": "Pediatrics",
    "adhd": "Pediatrics"
}

def map_disease_to_specialty(disease_name: str) -> str:
    """
    Maps a disease name to a specialty using strict match or fuzzy logic.
    Returns 'General' if no match found.
    """
    disease_lower = disease_name.lower().strip()
    
    # Direct match
    if disease_lower in DISEASE_SPECIALTY_MAP:
        return DISEASE_SPECIALTY_MAP[disease_lower]
    
    # Fuzzy match
    match = difflib.get_close_matches(disease_lower, DISEASE_SPECIALTY_MAP.keys(), n=1, cutoff=0.6)
    if match:
        return DISEASE_SPECIALTY_MAP[match[0]]
        
    return "General"
