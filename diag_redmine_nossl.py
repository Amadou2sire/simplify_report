import os
import requests
import urllib3
from dotenv import load_dotenv

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

base_url = os.getenv("REDMINE_BASE_URL").rstrip('/')
api_key = os.getenv("REDMINE_API_KEY")
headers = {"X-Redmine-API-Key": api_key}

print(f"DIAGNOSTIC (SSL=False) - Target: {base_url}")
try:
    print("Step 1: Fetching trackers (timeout=5s, verify=False)...")
    r = requests.get(f"{base_url}/trackers.json", headers=headers, timeout=5, verify=False)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:300]}")
except Exception as e:
    print(f"DIAGNOSTIC FAILED: {e}")
