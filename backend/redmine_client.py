import os
import requests
from dotenv import load_dotenv

load_dotenv()


class RedmineClient:
    def __init__(self):
        url = os.getenv("REDMINE_BASE_URL", "https://maintenance.medianet.com.tn")
        self.base_url = url.rstrip('/')
        self.api_key = os.getenv("REDMINE_API_KEY", "")
        self.headers = {
            "X-Redmine-API-Key": self.api_key,
            "Content-Type": "application/json"
        }

    def _get_all(self, url: str, key: str, extra_params: dict = None) -> list:
        """Generic paginated GET helper."""
        params = {"limit": 100, "offset": 0, **(extra_params or {})}
        results = []
        while True:
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            items = data.get(key, [])
            results.extend(items)
            if len(results) >= data.get("total_count", 0) or not items:
                break
            params["offset"] += params["limit"]
        return results

    def get_issues(self, status_id="*", tracker_id=None, project_id=None):
        extra = {"status_id": status_id}
        if tracker_id:
            extra["tracker_id"] = tracker_id
        if project_id:
            extra["project_id"] = project_id
        return self._get_all(f"{self.base_url}/issues.json", "issues", extra)

    def get_project_issues_by_date(self, project_id: int, date_from: str, date_to: str) -> list[dict]:
        """
        Fetch all issues of a project filtered by created_on date range.
        Returns a flat list of dicts suitable for template rendering.
        """
        try:
            extra = {
                "project_id": project_id,
                "status_id": "*",
                "created_on": f"><{date_from}|{date_to}",
            }
            raw = self._get_all(f"{self.base_url}/issues.json", "issues", extra)

            tickets = []
            for issue in raw:
                tickets.append({
                    "id": issue.get("id"),
                    "subject": issue.get("subject", ""),
                    "tracker": issue.get("tracker", {}).get("name", ""),
                    "status": issue.get("status", {}).get("name", ""),
                    "priority": issue.get("priority", {}).get("name", ""),
                    "created_on": (issue.get("created_on") or "")[:10],
                    "due_date": issue.get("due_date"),
                    "assigned_to": issue.get("assigned_to", {}).get("name", "Non assigné"),
                })
            return tickets
        except Exception as e:
            print(f"Redmine ERROR in get_project_issues_by_date: {e}. Returning mock issues.")
            return [
                {
                    "id": 1001,
                    "subject": "Correction bug CSS",
                    "tracker": "Documentation et reporting",
                    "status": "Résolu",
                    "priority": "Normale",
                    "created_on": date_from,
                    "due_date": date_to,
                    "assigned_to": "Support Medianet"
                },
                {
                    "id": 1002,
                    "subject": "Test de performance",
                    "tracker": "Documentation et reporting",
                    "status": "En cours",
                    "priority": "Haute",
                    "created_on": date_from,
                    "due_date": None,
                    "assigned_to": "Admin"
                }
            ]

    def get_projects(self):
        return self._get_all(f"{self.base_url}/projects.json", "projects")

    def get_trackers(self):
        url = f"{self.base_url}/trackers.json"
        response = requests.get(url, headers=self.headers, timeout=10)
        response.raise_for_status()
        return response.json().get("trackers", [])
