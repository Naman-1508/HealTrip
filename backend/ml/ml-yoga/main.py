import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as yoga_router

app = FastAPI(title="HealTrip Yoga Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(yoga_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Yoga Engine"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
