from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import json
from typing import List
import shutil

# Import the existing modules
import main as ats_main
import export_results

app = FastAPI(title="ATS Backend System", description="FastAPI Server for Resume Analysis")

# CORS setup matching Node.js server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "candidates_data.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "resumes_to_process")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory global jobs store
jobsStore = [
    { "id": "1", "title": "Senior Frontend Developer", "department": "Engineering", "status": "Active", "type": "Full-time", "location": "Remote", "applicants": 45, "postedDate": "2 days ago" },
    { "id": "2", "title": "Product Marketing Manager", "department": "Marketing", "status": "Draft", "type": "Contract", "location": "Hybrid", "applicants": 0, "postedDate": "1 hour ago" },
    { "id": "3", "title": "UX/UI Designer", "department": "Design", "status": "Closed", "type": "Full-time", "location": "Remote", "applicants": 112, "postedDate": "14 days ago" },
]

@app.post("/api/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    job_id: str = Form(None),
    job_description: str = Form(None),
    expected_skills: str = Form(None)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
        
    skills_list = []
    if expected_skills:
        try:
            skills_list = json.loads(expected_skills)
        except Exception:
            skills_list = []
    
    uploaded_files = []
    try:
        # Save files to resumes_to_process
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            uploaded_files.append(file.filename)
        
        print(f"\n [Folder] {len(uploaded_files)} file(s) saved.")
        
        # Run main.py AI Processing
        print(' [AI] Running ATS Pipeline (AI Processing)...')
        ats_main.run_ats_pipeline(expected_skills=skills_list, job_id=job_id, job_description=job_description)
        
        # Run export_results.py
        print(' [CSV] Running CSV Export...')
        export_results.generate_vishesh_report()
        
        print(' [Success] Pipeline finished successfully.\n')

        return {
            "success": True,
            "message": f"{len(uploaded_files)} resume(s) processed by AI pipeline.",
            "files": uploaded_files,
        }
    except Exception as e:
        print(f" [Error] Python pipeline error: {str(e)}")
        return JSONResponse(status_code=500, content={
            "success": False,
            "error": f"Python pipeline failed: {str(e)}",
            "files": uploaded_files
        })

@app.get("/api/download-csv")
def download_csv():
    csv_path = os.path.join(BASE_DIR, "vishesh_report.csv")
    if not os.path.exists(csv_path):
        return JSONResponse(status_code=404, content={"error": "CSV report not found. Upload and process resumes first."})
    
    return FileResponse(path=csv_path, filename="candidates_report.csv", media_type='text/csv')

@app.get("/api/candidates")
def get_candidates():
    if not os.path.exists(JSON_PATH):
        return {"candidates": []}
    
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            candidates = json.load(f)
            
        # Sort by match_score DESC
        candidates.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        
        # Parse skills and experience formatting
        for c in candidates:
            # skills
            skills = c.get("skills", [])
            if isinstance(skills, str):
                try:
                    c["skills"] = json.loads(skills) if skills else []
                except:
                    c["skills"] = []
            
            # experience
            exp = c.get("experience", "Fresher")
            if isinstance(exp, list) and len(exp) > 0:
                c["experience"] = exp[0]
            elif not exp:
                c["experience"] = "Fresher"
                
        return {"candidates": candidates}
        
    except Exception as e:
        print(f"JSON data error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": "Failed to read candidates", "detail": str(e)})

@app.get("/api/system-status")
def system_status():
    if not os.path.exists(JSON_PATH):
        return {"online": False, "message": "JSON file not found", "candidateCount": 0}
        
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            candidates = json.load(f)
            
        count = len(candidates)
        return {
            "online": True,
            "message": f"System Online: {count} Candidates Indexed",
            "candidateCount": count
        }
    except Exception as e:
        return {"online": False, "message": f"Error: {str(e)}", "candidateCount": 0}

@app.get("/api/jobs")
def get_jobs():
    return {"jobs": jobsStore}

@app.post("/api/jobs")
async def create_job(job_data: dict):
    import time
    job = {
        "id": str(int(time.time())),
        "applicants": 0,
        "postedDate": "Just now",
        "status": "Active",
        "type": "Full-time",
        "department": "General",
    }
    job.update(job_data)
    # prepend to list
    jobsStore.insert(0, job)
    return JSONResponse(status_code=201, content={"job": job})

if __name__ == "__main__":
    import uvicorn
    # Make sure we use port 3001 to match the Vite Proxy config
    print(f"\n [Server] ATS API server starting at http://localhost:3001")
    uvicorn.run("api:app", host="0.0.0.0", port=3001, reload=True)
