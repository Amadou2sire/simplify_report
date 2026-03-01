import os
import requests
from dotenv import load_dotenv

load_dotenv()

base_url = os.getenv("REDMINE_BASE_URL").rstrip('/')
api_key = os.getenv("REDMINE_API_KEY")
headers = {"X-Redmine-API-Key": api_key}

print(f"Testing Redmine at: {base_url}")
try:
    print("Fetching trackers...")
    r = requests.get(f"{base_url}/trackers.json", headers=headers, timeout=10)
    print(f"Trackers Status: {r.status_code}")
    if r.status_code == 200:
        trackers = r.json().get('trackers', [])
        print(f"Found {len(trackers)} trackers.")
        for t in trackers:
            print(f" - {t['name']} (ID: {t['id']})")
    else:
        print(f"Error: {r.text}")

    print("\nFetching issues (tracker_id=Documentation et reporting)...")
    # First find the ID again
    tid = None
    if r.status_code == 200:
        for t in r.json().get('trackers', []):
            if t['name'].lower() == "documentation et reporting":
                tid = t['id']
                break
    
    if tid:
        r2 = requests.get(f"{base_url}/issues.json", params={"tracker_id": tid, "limit": 5}, headers=headers, timeout=10)
        print(f"Issues Status: {r2.status_code}")
        if r2.status_code == 200:
            issues = r2.json().get('issues', [])
            print(f"Found {len(issues)} issues (limited to 5 for test).")
    else:
        print("Tracker not found, skipping issues test.")

except Exception as e:
    print(f"REDMINE TEST FAILED: {e}")
