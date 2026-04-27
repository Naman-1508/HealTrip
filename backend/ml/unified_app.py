import importlib.util
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HealTrip Unified ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_app(module_path, module_name):
    """Dynamically loads a FastAPI app and ensures models are loaded."""
    abs_path = os.path.join(BASE_DIR, module_path)
    if not os.path.exists(abs_path):
        print(f"⚠️ Warning: Could not find {abs_path}")
        return None
    
    # Isolate imports for this service
    service_dir = os.path.dirname(abs_path)
    if service_dir not in sys.path:
        sys.path.insert(0, service_dir)
        
    # Clear any previously loaded 'api' modules to prevent shadowing
    if 'api' in sys.modules:
        del sys.modules['api']
    if 'api.routes' in sys.modules:
        del sys.modules['api.routes']
        
    spec = importlib.util.spec_from_file_location(module_name, abs_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    
    # We remove the synchronous load_models() call here because it causes 504 timeouts on Render
    # The models will now load the first time they are actually requested (Lazy Loading)
    # This ensures the server starts instantly and respects Render's 512MB RAM limit.
    
    return module.app

# Load all sub-apps
services = [
    ("hotels/main.py", "hotels"),
    ("hospitals/main.py", "hospitals"),
    ("flights/main.py", "flights"),
    ("visa/backend/main.py", "visa"),
    ("ml-mental/main.py", "mental"),
    ("ml-yoga/main.py", "yoga"),
]

for path, name in services:
    sub_app = load_app(path, name)
    if sub_app:
        app.mount(f"/{name}", sub_app)
        print(f"✅ Mounted {name} service at /{name}")

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "HealTrip Unified ML Engine",
        "endpoints": [f"/{s[1]}" for s in services]
    }
if __name__ == "__main__":
    import uvicorn
    # Use port 8000 for the unified engine
    uvicorn.run(app, host="0.0.0.0", port=8000)
