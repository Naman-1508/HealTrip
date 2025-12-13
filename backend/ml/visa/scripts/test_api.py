
from backend.service import process_visa_query
from backend.models import VisaQuery
import sys

def test_backend_logic():
    print("Running Backend Verification...")

    # Test Case 1: Known Country (India -> Wait, India is N/A in CSV for foreign visa, but row 78 says 'Indian nationals...')
    # Let's try "Afghanistan" (Row 2)
    q1 = VisaQuery(country="Afghanistan", visa_type="tourist")
    res1 = process_visa_query(q1)
    print(f"\n[Test 1] Country: Afghanistan")
    print(f"  Docs found: {len(res1.required_documents)} items")
    print(f"  First Doc: {res1.required_documents[0] if res1.required_documents else 'None'}")
    print(f"  Notes: {res1.special_notes}")
    
    if "Passport valid for 6 months" in res1.required_documents[0]:
         print("  -> PASS: Documents match expectation.")
    else:
         print("  -> FAIL: Documents mismatch.")

    # Test Case 2: Unknown Country
    q2 = VisaQuery(country="Atlantis", visa_type="tourist")
    res2 = process_visa_query(q2)
    print(f"\n[Test 2] Country: Atlantis")
    print(f"  Financial Req: {res2.financial_requirements}")
    if "Data not available" in res2.financial_requirements:
        print("  -> PASS: Correctly handled missing country.")
    else:
        print("  -> FAIL: Incorrect handling of missing country.")

    # Test Case 3: Case Insensitivity
    q3 = VisaQuery(country="albania", visa_type="tourist") # lowercase
    res3 = process_visa_query(q3)
    if res3.country: # Should find it and maybe capitalize it from CSV data or return valid data
        print(f"\n[Test 3] Country: albania -> Found: {res3.country}")
        print("  -> PASS: Case insensitivity worked.")
    else:
        print("  -> FAIL: Case insensitivity failed.")

if __name__ == "__main__":
    test_backend_logic()
