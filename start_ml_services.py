"""
HealTrip ML Services Launcher
Starts all three ML services (Hotels, Hospitals, Flights) in parallel
"""
import subprocess
import sys
import time
import os

def start_service(name, port, directory):
    """Start a single ML service"""
    print(f"[{name}] Starting on port {port}...")
    
    # Change to service directory and start uvicorn
    cmd = [
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
        "--reload"
    ]
    
    process = subprocess.Popen(
        cmd,
        cwd=directory,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    return process

def main():
    print("=" * 60)
    print("HealTrip ML Services Launcher")
    print("=" * 60)
    print()
    
    # Get base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ml_dir = os.path.join(base_dir, "backend", "ml")
    
    # Service configurations
    services = [
        ("Hotels", 8000, os.path.join(ml_dir, "hotels")),
        ("Hospitals", 8001, os.path.join(ml_dir, "hospitals")),
        ("Flights", 8002, os.path.join(ml_dir, "flights"))
    ]
    
    processes = []
    
    try:
        # Start all services
        for name, port, directory in services:
            if not os.path.exists(directory):
                print(f"[ERROR] Directory not found: {directory}")
                continue
                
            process = start_service(name, port, directory)
            processes.append((name, port, process))
            time.sleep(1)  # Small delay between starts
        
        print()
        print("=" * 60)
        print("All services started!")
        print("=" * 60)
        print()
        print("Services running on:")
        for name, port, _ in processes:
            print(f"  • {name:12} http://localhost:{port}")
        print()
        print("Press Ctrl+C to stop all services...")
        print()
        
        # Keep running and monitor processes
        while True:
            time.sleep(1)
            
            # Check if any process has died
            for name, port, process in processes:
                if process.poll() is not None:
                    print(f"[WARNING] {name} service stopped unexpectedly!")
                    
    except KeyboardInterrupt:
        print("\n\nStopping all services...")
        
        # Terminate all processes
        for name, port, process in processes:
            print(f"[{name}] Stopping...")
            process.terminate()
            
        # Wait for all to finish
        for name, port, process in processes:
            process.wait()
            print(f"[{name}] Stopped")
            
        print("\nAll services stopped!")

if __name__ == "__main__":
    main()
