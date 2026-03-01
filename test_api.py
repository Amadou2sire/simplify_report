import requests
import time

try:
    print("Testing /health...")
    r = requests.get("http://localhost:8000/health", timeout=5)
    print(f"Health: {r.status_code} - {r.text}")
    
    print("Testing /api/reports (this might take time)...")
    start = time.time()
    r = requests.get("http://localhost:8000/api/reports", timeout=30)
    end = time.time()
    print(f"Reports: {r.status_code} in {end-start:.2f}s")
    print(f"Body: {r.text[:200]}...")
except Exception as e:
    print(f"TEST FAILED: {e}")
