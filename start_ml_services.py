import subprocess
import time
import os
import sys

# Define services with their directory and port
services = [
    {
        "name": "Hotels ML Service",
        "path": "backend/ml/hotels",
        "port": 8000,
        "command": "python main.py"
    },
    {
        "name": "Hospitals ML Service",
        "path": "backend/ml/hospitals",
        "port": 8001,
        "command": "python main.py"
    },
    {
        "name": "Flights ML Service",
        "path": "backend/ml/flights",
        "port": 8002,
        "command": "python main.py"
    },
    {
        "name": "Visa ML Service",
        "path": "backend/ml/visa/backend",
        "port": 8003,
        "command": "python main.py"
    },
    {
        "name": "Mental Health ML Service",
        "path": "backend/ml/ml-mental",
        "port": 8004,
        "command": "python main.py"
    },
    {
        "name": "Yoga ML Service",
        "path": "backend/ml/ml-yoga",
        "port": 8005,
        "command": "python main.py"
    }
]

def start_services():
    processes = []
    base_dir = os.getcwd()
    
    print("🚀 Starting HealTrip ML Services...")
    print("========================================")

    for service in services:
        print(f"⏳ Starting {service['name']} on port {service['port']}...")
        
        # Construct absolute path to the service directory
        service_dir = os.path.join(base_dir, service['path'])
        
        if not os.path.exists(service_dir):
            print(f"❌ Error: Directory not found - {service_dir}")
            continue

        try:
            # Start the process - using string command with shell=True for flexibility
            # or separate args if we wanted to be more strict. shell=True works well for 'python main.py'
            # We use creationflags=subprocess.CREATE_NEW_CONSOLE to open in new windows on Windows
            # so output doesn't get mixed up, if preferred. 
            # User asked for "check if its properly working or not" -> typically easier to debug if they share a console or log to file.
            # But separate consoles is safer for distinct service logs.
            
            # For this implementation, let's spawn them in new console windows so the user can see each running.
            if sys.platform == "win32":
                p = subprocess.Popen(
                    f"cd {service['path']} && {service['command']}", 
                    shell=True, 
                    creationflags=subprocess.CREATE_NEW_CONSOLE,
                    cwd=base_dir # Execute from base, but cd inside the command string
                )
                
                # ALTERNATIVE: cwd argument to Popen
                # p = subprocess.Popen(
                #     ["python", "main.py"],
                #     cwd=service_dir,
                #     creationflags=subprocess.CREATE_NEW_CONSOLE
                # )
                
            else:
                # tailored for linux/mac if needed later
                p = subprocess.Popen(
                    ["python", "main.py"],
                    cwd=service_dir
                )
            
            processes.append(p)
            print(f"✅ {service['name']} started.")
            time.sleep(2) # Wait a bit between starts
            
        except Exception as e:
            print(f"❌ Failed to start {service['name']}: {e}")

    print("========================================")
    print("All services attempted.")
    print("Press Ctrl+C in the individual windows to stop them.")
    print("To stop this script, press Ctrl+C (it won't stop the spawned windows automatically unless managed).")

    # Simple keep-alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nExiting launcher...")

if __name__ == "__main__":
    start_services()
