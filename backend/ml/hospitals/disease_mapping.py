import difflib

DISEASE_SPECIALTY_MAP = {
    # Cardiology
    "coronary artery disease": {"specialty": "Cardiology", "cost": 250000},
    "myocardial infarction": {"specialty": "Cardiology", "cost": 300000},
    "heart attack": {"specialty": "Cardiology", "cost": 300000},
    "arrhythmia": {"specialty": "Cardiology", "cost": 150000},
    "heart failure": {"specialty": "Cardiology", "cost": 200000},
    "atrial fibrillation": {"specialty": "Cardiology", "cost": 180000},
    "hypertension": {"specialty": "Cardiology", "cost": 50000},
    "hypertrophic cardiomyopathy": {"specialty": "Cardiology", "cost": 220000},

    # Neurology
    "stroke": {"specialty": "Neurology", "cost": 200000},
    "epilepsy": {"specialty": "Neurology", "cost": 100000},
    "migraine": {"specialty": "Neurology", "cost": 30000},
    "parkinson's disease": {"specialty": "Neurology", "cost": 150000},
    "alzheimer's disease": {"specialty": "Neurology", "cost": 180000},
    "multiple sclerosis": {"specialty": "Neurology", "cost": 250000},
    "brain tumor": {"specialty": "Neurology", "cost": 450000},

    # Oncology
    "breast cancer": {"specialty": "Oncology", "cost": 400000},
    "lung cancer": {"specialty": "Oncology", "cost": 500000},
    "leukemia": {"specialty": "Oncology", "cost": 600000},
    "lymphoma": {"specialty": "Oncology", "cost": 450000},
    "prostate cancer": {"specialty": "Oncology", "cost": 350000},
    "colorectal cancer": {"specialty": "Oncology", "cost": 400000},
    "skin cancer": {"specialty": "Oncology", "cost": 150000},

    # Gastroenterology
    "gerd": {"specialty": "Gastroenterology", "cost": 40000},
    "acid reflux": {"specialty": "Gastroenterology", "cost": 30000},
    "ibs": {"specialty": "Gastroenterology", "cost": 35000},
    "irritable bowel syndrome": {"specialty": "Gastroenterology", "cost": 35000},
    "crohn's disease": {"specialty": "Gastroenterology", "cost": 120000},
    "ulcerative colitis": {"specialty": "Gastroenterology", "cost": 110000},
    "liver cirrhosis": {"specialty": "Gastroenterology", "cost": 300000},
    "hepatitis": {"specialty": "Gastroenterology", "cost": 60000},

    # Orthopedics
    "osteoarthritis": {"specialty": "Orthopedics", "cost": 180000},
    "rheumatoid arthritis": {"specialty": "Orthopedics", "cost": 80000},
    "fracture": {"specialty": "Orthopedics", "cost": 50000},
    "scoliosis": {"specialty": "Orthopedics", "cost": 250000},
    "herniated disc": {"specialty": "Orthopedics", "cost": 150000},
    "acl tear": {"specialty": "Orthopedics", "cost": 120000},
    "osteoporosis": {"specialty": "Orthopedics", "cost": 40000},

    # Nephrology
    "kidney failure": {"specialty": "Nephrology", "cost": 300000},
    "chronic kidney disease": {"specialty": "Nephrology", "cost": 250000},
    "kidney stones": {"specialty": "Nephrology", "cost": 60000},
    "renal failure": {"specialty": "Nephrology", "cost": 300000},
    "glomerulonephritis": {"specialty": "Nephrology", "cost": 150000},
    
    # Endocrinology
    "diabetes": {"specialty": "Endocrinology", "cost": 25000},
    "hypothyroidism": {"specialty": "Endocrinology", "cost": 15000},
    "hyperthyroidism": {"specialty": "Endocrinology", "cost": 20000},
    "pcos": {"specialty": "Endocrinology", "cost": 30000},
    "pcod": {"specialty": "Endocrinology", "cost": 30000},
    "addison's disease": {"specialty": "Endocrinology", "cost": 50000},
    "cushing's syndrome": {"specialty": "Endocrinology", "cost": 100000},

    # Pediatrics
    "chickenpox": {"specialty": "Pediatrics", "cost": 10000},
    "measles": {"specialty": "Pediatrics", "cost": 12000},
    "mumps": {"specialty": "Pediatrics", "cost": 12000},
    "asthma": {"specialty": "Pediatrics", "cost": 20000},
    "pneumonia": {"specialty": "Pediatrics", "cost": 35000},
    "adhd": {"specialty": "Pediatrics", "cost": 40000}
}

def map_disease_to_specialty(disease_name: str) -> str:
    """
    Maps a disease name to a specialty using strict match or fuzzy logic.
    Returns 'General' if no match found.
    """
    disease_lower = disease_name.lower().strip()
    
    # Direct match
    if disease_lower in DISEASE_SPECIALTY_MAP:
        # Check if it's the new dict format or old str format
        # If we fully reverted dict to str, we just return.
        # But if dict is still complex, we access ['specialty']
        # Since I'm doing this step in parallel/sequence, I should revert the dict too.
        # But for now let's assume I will revert the dict in the next step or this function will break if I don't.
        # WAIT: I should revert the DICT content first or simultaneously.
        # To be safe, I'm writing this function to EXPECT the complex dict but return STR,
        # OR I revert the dict to simple key-value.
        # Let's revert the function logic to what it was, effectively.
        
        # If dict has 'specialty' key:
        val = DISEASE_SPECIALTY_MAP[disease_lower]
        if isinstance(val, dict):
             return val['specialty']
        return val
    
    # Fuzzy match
    match = difflib.get_close_matches(disease_lower, DISEASE_SPECIALTY_MAP.keys(), n=1, cutoff=0.6)
    if match:
        val = DISEASE_SPECIALTY_MAP[match[0]]
        if isinstance(val, dict):
             return val['specialty']
        return val
        
    return "General"
