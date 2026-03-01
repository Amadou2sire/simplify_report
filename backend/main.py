import traceback
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from redmine_client import RedmineClient
from logic import process_project_reports
from report_generator import generate_pdf, get_report_html

app = FastAPI(title="Redmine Activity Report API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use a global client instance
try:
    client = RedmineClient()
except Exception as e:
    print(f"ERROR: Failed to initialize RedmineClient: {e}")
    client = None


@app.get("/health")
def health_check():
    return {"status": "ok", "redmine_configured": client is not None}


@app.get("/api/reports")
def get_reports():
    """Main dashboard — all projects, Documentation et reporting tracker, J+2 logic."""
    if not client:
        raise HTTPException(status_code=500, detail="Redmine client not configured. Check .env")
    try:
        print("API: Handling /api/reports request...")
        data = process_project_reports(client)
        print(f"API: Returning {len(data)} report items.")
        return data
    except Exception as e:
        print(f"API ERROR in /api/reports: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/issues")
def get_project_issues(
    project_id: int,
    date_from: str = Query(..., description="Format YYYY-MM-DD"),
    date_to: str = Query(..., description="Format YYYY-MM-DD"),
    project_name: str = Query("", description="Project display name"),
):
    """Returns all tickets of a project whose created_on date falls within [date_from, date_to]."""
    if not client:
        raise HTTPException(status_code=500, detail="Redmine client not configured.")
    try:
        issues = client.get_project_issues_by_date(project_id, date_from, date_to)
        return {
            "project_id": project_id,
            "project_name": project_name,
            "date_from": date_from,
            "date_to": date_to,
            "total": len(issues),
            "issues": issues,
        }
    except Exception as e:
        print(f"API ERROR in /api/projects/{project_id}/issues: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/report")
def generate_project_report(
    project_id: int,
    date_from: str = Query(..., description="Format YYYY-MM-DD"),
    date_to: str = Query(..., description="Format YYYY-MM-DD"),
    project_name: str = Query("Projet", description="Project display name"),
):
    """Generates and returns a PDF report for the project and date range."""
    if not client:
        raise HTTPException(status_code=500, detail="Redmine client not configured.")
    try:
        issues = client.get_project_issues_by_date(project_id, date_from, date_to)
        pdf_bytes = generate_pdf(
            project_id=project_id,
            project_name=project_name,
            date_from=date_from,
            date_to=date_to,
            tickets=issues,
        )
        filename = f"rapport_{project_id}_{date_from}_{date_to}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        print(f"API ERROR in /api/projects/{project_id}/report: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/template")
def get_project_report_template(
    project_id: int,
    date_from: str = Query(..., description="Format YYYY-MM-DD"),
    date_to: str = Query(..., description="Format YYYY-MM-DD"),
    project_name: str = Query("Projet", description="Project display name"),
):
    """Returns the rendered HTML template for the project and date range."""
    if not client:
        raise HTTPException(status_code=500, detail="Redmine client not configured.")
    try:
        issues = client.get_project_issues_by_date(project_id, date_from, date_to)
        html = get_report_html(
            project_name=project_name,
            date_from=date_from,
            date_to=date_to,
            tickets=issues,
        )
        return Response(content=html, media_type="text/html")
    except Exception as e:
        print(f"API ERROR in /api/projects/{project_id}/template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
