
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import VisaQuery, VisaResponse
from service import process_visa_query

app = FastAPI(title="Visa Requirement Intelligence Engine")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/visa-requirements", response_model=VisaResponse)
def get_visa_requirements(query: VisaQuery):
    """
    Returns visa requirements for a given country and parameters.
    """
    return process_visa_query(query)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Visa Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8003, reload=False)

