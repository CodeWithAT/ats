import os
import re
import json
import fitz  # PyMuPDF
import spacy
import logging
import shutil
import gc
import psutil
from datetime import datetime
import cv2
import numpy as np
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import easyocr

# ═══════════════════════════════════════════════════════════════════════════
# 1. SYSTEM CONFIG & KNOWLEDGE DATABASES
# ═══════════════════════════════════════════════════════════════════════════
logging.basicConfig(filename='ats_system.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# ─── PRODUCTION SKILLS DATABASE (80+ entries) ─────────────────────────────
KNOWN_SKILLS = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "golang", "ruby",
    "kotlin", "swift", "rust", "scala", "php", "dart", "r",
    # Frontend
    "react", "angular", "vue", "svelte", "next.js", "nuxt", "html", "css",
    "tailwind", "bootstrap", "sass", "jquery", "redux", "webpack",
    "figma", "ui/ux", "material ui",
    # Backend
    "node.js", "express", "fastapi", "django", "flask", "spring boot",
    "spring security", "hibernate", "rest api", "graphql", "microservices",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase", "sqlite", "oracle",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform",
    "ci/cd", "linux", "nginx", "apache tomcat",
    # Data & ML
    "machine learning", "deep learning", "nlp", "data analytics", "data science",
    "pandas", "numpy", "tensorflow", "pytorch", "tableau", "power bi",
    # Tools
    "git", "maven", "gradle", "postman", "swagger", "junit", "jest",
    "selenium", "jira", "confluence", "agile", "scrum", "kafka", "rabbitmq",
    "puppeteer",
    # Auth
    "oauth", "jwt",
    # Business / HR / Soft Skills
    "human resource", "recruitment", "management", "event management",
    "marketing", "leadership", "itsm", "project management",
    "content management", "sap", "salesforce", "excel",
]

# ─── INDIAN CITIES (Tiered: Tier1 = major cities, preferred over Tier2) ───
TIER1_CITIES = [
    "delhi", "new delhi", "mumbai", "bangalore", "bengaluru", "chennai",
    "hyderabad", "kolkata", "pune", "noida", "gurugram", "gurgaon",
    "ghaziabad", "lucknow", "jaipur", "chandigarh", "ahmedabad", "indore",
    "bhopal", "patna", "nagpur", "surat", "coimbatore", "kochi",
    "bhubaneswar", "ranchi", "dehradun", "kanpur", "agra", "varanasi",
]
TIER2_CITIES = [
    "rohini", "etawah", "ajmer", "meerut", "allahabad", "prayagraj",
    "mathura", "aligarh", "bareilly", "gorakhpur", "faridabad",
    "santa fe", "berkeley", "san francisco", "new york",
]
ALL_CITIES = TIER1_CITIES + TIER2_CITIES

# ─── OCR COMMON BREAKS (city names split by OCR) ─────────────────────────
OCR_CITY_FIXES = {
    "k anpur": "kanpur", "kan pur": "kanpur",
    "ghaz iabad": "ghaziabad", "ghazi abad": "ghaziabad",
    "banga lore": "bangalore", "benga luru": "bengaluru",
    "hyde rabad": "hyderabad", "chen nai": "chennai",
    "mum bai": "mumbai", "kol kata": "kolkata",
    "luck now": "lucknow", "chan digarh": "chandigarh",
}

OCR_SKILL_FIXES = {
    "java script": "javascript", "javas cript": "javascript",
    "type script": "typescript", "types cript": "typescript",
    "node js": "node.js", "node. js": "node.js",
    "react js": "react", "react. js": "react",
    "next js": "next.js", "next. js": "next.js",
    "spring boot": "spring boot",
    "machine learn": "machine learning",
    "deep learn": "deep learning",
    "elastic search": "elasticsearch",
    "tail wind": "tailwind", "tailwind css": "tailwind",
    "boot strap": "bootstrap", "post man": "postman",
    "power bi": "power bi",
    "ui / ux": "ui/ux", "ui/ ux": "ui/ux", "ui /ux": "ui/ux",
    "restful apis": "rest api", "restful api": "rest api",
    "ci / cd": "ci/cd", "ci/ cd": "ci/cd",
    "spring secur": "spring security",
    "data analy": "data analytics",
}


def calculate_optimal_threads(num_files):
    cpu_cores = os.cpu_count() or 2
    available_ram_gb = psutil.virtual_memory().available / (1024 ** 3)
    safe_threads_by_ram = max(1, int(available_ram_gb // 1.2))
    safe_threads_by_cpu = max(1, cpu_cores - 1)
    optimal_threads = min(num_files, safe_threads_by_cpu, safe_threads_by_ram)
    return min(optimal_threads, 5)


print("Loading Enterprise AI & Deep Learning Models...")
global_ocr_reader = easyocr.Reader(['en'], gpu=False)

try:
    global_nlp = spacy.load("en_core_web_md")
except:
    global_nlp = spacy.load("en_core_web_sm")

db_lock = threading.Lock()


# ═══════════════════════════════════════════════════════════════════════════
# 2. TEXT & IMAGE EXTRACTION
# ═══════════════════════════════════════════════════════════════════════════

def extract_profile_picture_pdf(doc, filename: str) -> str:
    pic_folder = os.path.join("archive", "profile_pics")
    os.makedirs(pic_folder, exist_ok=True)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    try:
        for i in range(len(doc)):
            for img in doc[i].get_images(full=True):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                pix = fitz.Pixmap(doc, xref)
                aspect_ratio = pix.width / pix.height if pix.height > 0 else 0
                if pix.width > 80 and pix.height > 80 and 0.4 <= aspect_ratio <= 1.5:
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if img_cv is not None:
                        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
                        if len(faces) > 0:
                            safe_name = filename.replace(".pdf", "")
                            img_filepath = os.path.join(pic_folder, f"{safe_name}_profile.{image_ext}")
                            with open(img_filepath, "wb") as f:
                                f.write(image_bytes)
                            return img_filepath
    except Exception:
        pass
    return "No Photo"


def extract_face_from_image(file_path: str, filename: str) -> str:
    pic_folder = os.path.join("archive", "profile_pics")
    os.makedirs(pic_folder, exist_ok=True)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    try:
        img_cv = cv2.imread(file_path)
        if img_cv is not None:
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
            if len(faces) > 0:
                x, y, w, h = faces[0]
                face_img = img_cv[y:y+h, x:x+w]
                safe_name = filename.rsplit(".", 1)[0]
                img_filepath = os.path.join(pic_folder, f"{safe_name}_profile.jpg")
                cv2.imwrite(img_filepath, face_img)
                return img_filepath
    except Exception:
        pass
    return "No Photo"


def get_text_from_file(file_path: str, filename: str) -> tuple:
    """Extract raw text + visual name from PDF or image."""
    global global_ocr_reader
    file_ext = file_path.lower().split('.')[-1]
    raw_text = ""
    visual_name = ""

    NAME_BLACKLIST = [
        "resume", "cv", "curriculum vitae", "contact", "objective",
        "summary", "profile", "professional", "experience", "education",
        "skills", "technical", "work", "projects", "certifications",
        "achievements", "leadership", "awards", "references", "declaration",
        "personal", "hobbies", "interests", "languages", "details",
        "social", "awareness", "campaigns", "cultural", "events",
        "extracurricular", "activities", "positions", "responsibility",
        "engagement", "academic", "volunteer", "other",
    ]

    def extract_name_by_font_size(doc):
        max_size = 0
        best_name = ""
        try:
            for page in doc:
                for block in page.get_text("dict").get("blocks", []):
                    if block.get("type") == 0:
                        for line in block.get("lines", []):
                            line_text = ""
                            line_size = 0
                            for span in line.get("spans", []):
                                text = span.get("text", "").strip()
                                size = span.get("size", 0)
                                if text:
                                    line_text += text + " "
                                    line_size = max(line_size, size)
                            line_text = line_text.strip()
                            # Handle pipe-separated headers: "Name | Gender, Age"
                            if '|' in line_text:
                                line_text = line_text.split('|')[0].strip()
                            alpha_only = re.sub(r'[^A-Za-z\s]', '', line_text).strip()
                            words_check = alpha_only.split()
                            if (line_size > max_size
                                    and len(alpha_only) > 2
                                    and 1 <= len(words_check) <= 4
                                    and not any(b in line_text.lower() for b in NAME_BLACKLIST)):
                                max_size = line_size
                                best_name = alpha_only
            words = best_name.split()
            if len(words) >= 3:
                return f"{words[0]} {words[1]} {words[2]}".title()
            elif len(words) == 2:
                return f"{words[0]} {words[1]}".title()
            elif len(words) == 1:
                return words[0].title()
        except:
            pass
        return ""

    def ocr_name_heuristic(text_list):
        for line in text_list[:8]:
            clean_line = re.sub(r'[^A-Za-z\s]', '', line).strip()
            words = clean_line.split()
            if 1 < len(words) <= 4:
                if not any(b in clean_line.lower() for b in NAME_BLACKLIST):
                    if any(w[0].isupper() for w in words if w):
                        return " ".join(words[:3]).title()
        return ""

    if file_ext == 'pdf':
        doc = fitz.open(file_path)
        full_text = []
        for page in doc:
            blocks = page.get_text("blocks")
            blocks.sort(key=lambda b: (b[1], b[0]))
            for b in blocks:
                full_text.append(re.sub(r'\s+', ' ', b[4].strip()))
        raw_text = " \n ".join(full_text)

        if len(raw_text.strip()) < 50:
            raw_text = ""
            for page in doc:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_data = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                text_list = global_ocr_reader.readtext(img_data, detail=0)
                raw_text += " \n ".join(text_list) + " \n "
                if not visual_name:
                    visual_name = ocr_name_heuristic(text_list)
        else:
            visual_name = extract_name_by_font_size(doc)

    elif file_ext in ['jpg', 'jpeg', 'png']:
        text_list = global_ocr_reader.readtext(file_path, detail=0)
        raw_text = " \n ".join(text_list)
        visual_name = ocr_name_heuristic(text_list)

    return raw_text, visual_name, file_ext == 'pdf'


# ═══════════════════════════════════════════════════════════════════════════
# 3. FIELD-LEVEL EXTRACTION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

def _clean_email(email: str) -> str:
    """Clean email: truncate at TLD, trim contaminated local part."""
    email = email.lower().strip()

    # 1. Truncate after TLD (remove trailing text like "comwebsitewww...")
    tld_match = re.search(r'@[a-z0-9.\-]+\.(com|org|net|edu|co\.in|co\.uk|io|dev|app|in)', email)
    if tld_match:
        email = email[:tld_match.end()]

    # 2. Remove linkedin/github contamination
    for domain in ["linkedin.com", "github.com", "vercel.app"]:
        if domain in email:
            email = email.split(domain)[0].rstrip('.')
            if '@' not in email:
                return "Not Found"

    # 3. Clean up local part (before @) — remove prefix contamination
    if '@' in email:
        local, domain = email.split('@', 1)
        # If local part is suspiciously long, try to find the real email start
        if len(local) > 30:
            # Look for a reasonable email pattern at the END of the local part
            # Real emails: name.surname, name123, etc.
            m = re.search(r'[a-z][a-z0-9._%+\-]{1,29}$', local)
            if m:
                local = m.group(0)
        email = f"{local}@{domain}"

    return email if '@' in email else "Not Found"


def extract_email(raw_text: str) -> str:
    """Extract email with aggressive OCR space-break repair."""
    text = raw_text

    # --- OCR Repair: fix spaces around @ and TLDs ---
    text = re.sub(r'\s*@\s*', '@', text)
    text = re.sub(r'\s*\.\s*com\b', '.com', text)
    text = re.sub(r'\s*\.\s*in\b', '.in', text)
    text = re.sub(r'\s*\.\s*org\b', '.org', text)
    text = re.sub(r'\s*\.\s*net\b', '.net', text)
    text = re.sub(r'\s*\.\s*edu\b', '.edu', text)
    text = re.sub(r'\s*\.\s*co\b', '.co', text)

    # --- Method 1: Labeled email field ("Email:", "E-mail ID:") ---
    labeled = re.search(
        r'(?:e[\-\s]?mail\s*(?:id)?\s*[:;]\s*)([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})',
        text, re.IGNORECASE)
    if labeled:
        return _clean_email(labeled.group(1))

    # --- Method 2: OCR deep repair — find @ and compress zone around it ---
    at_positions = [i for i, c in enumerate(text) if c == '@']
    for pos in at_positions:
        start = max(0, pos - 25)
        end = min(len(text), pos + 30)
        zone = text[start:end]
        compressed = re.sub(r'\s+', '', zone)
        m = re.search(r'[a-zA-Z0-9._%+\-]{2,40}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', compressed)
        if m:
            email = _clean_email(m.group(0))
            if "linkedin.com" not in email and "github.com" not in email and '@' in email:
                return email

    # --- Method 3: Standard regex on repaired text ---
    m = re.search(r'\b[a-zA-Z0-9._%+\-]{2,40}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b', text)
    if m:
        email = _clean_email(m.group(0))
        if '@' in email and '.' in email.split('@')[1]:
            return email

    return "Not Found"


def extract_phone(raw_text: str) -> str:
    """Extract phone with Indian (+91) and international format support."""
    clean = re.sub(r'\s+', ' ', raw_text)

    # Pattern 1: Indian with country code +91-XXXXXXXXXX
    m = re.search(r'(\+?91[\-\s.]?\d{10})\b', clean)
    if m:
        return m.group(1).strip()

    # Pattern 2: + followed by 10-12 digits (handles +9354695861)
    m = re.search(r'(\+\d{10,12})\b', clean)
    if m:
        return m.group(1).strip()

    # Pattern 3: Standalone 10-digit Indian number
    m = re.search(r'(?<!\d)(\d{10})(?!\d)', clean)
    if m:
        return m.group(1)

    # Pattern 4: US/intl format (XXX) XXX-XXXX
    m = re.search(r'(?:\+?\d{1,3}[\-.\s]?)?\(?\d{3}\)?[\-.\s]?\d{3}[\-.\s]?\d{4}', clean)
    if m:
        return m.group(0).strip()

    # Pattern 5: Near phone keywords
    m = re.search(r'(?:phone|mobile|contact|cell|tel)[\s:]*(\+?[\d\-\s]{10,15})', clean, re.IGNORECASE)
    if m:
        return re.sub(r'[^\d+\-]', '', m.group(1)).strip()

    return "Not Found"


def extract_location(raw_text: str) -> str:
    """Extract location using header-first strategy with tiered city priority."""
    global global_nlp
    text_lower = raw_text.lower()

    # Apply OCR city fixes
    for bad, good in OCR_CITY_FIXES.items():
        text_lower = text_lower.replace(bad, good)

    header = text_lower[:500]

    # Strategy 1: "City, India" pattern in header
    pattern = r'\b(' + '|'.join(re.escape(c) for c in ALL_CITIES) + r')\s*[,\s]+\s*india\b'
    m = re.search(pattern, header)
    if m:
        return m.group(1).title()

    # Strategy 2: Labeled "Address:" or "Location:" field — prefer Tier1
    addr_match = re.search(r'(?:postal\s+)?(?:address|location|city)\s*[:]\s*(.{5,80})', text_lower)
    if addr_match:
        addr_text = addr_match.group(1)
        for city in TIER1_CITIES:
            if city in addr_text:
                return city.title()
        for city in TIER2_CITIES:
            if city in addr_text:
                return city.title()

    # Strategy 3: Known cities in header — Tier1 first
    for city in TIER1_CITIES:
        if city in header:
            return city.title()
    for city in TIER2_CITIES:
        if city in header:
            return city.title()

    # Strategy 4: NLP GPE from header
    try:
        clean_header = re.sub(r'\s+', ' ', raw_text[:500])
        nlp_doc = global_nlp(clean_header)
        gpe_blacklist = {"india", "us", "usa", "uk", "city", "state", "md", "ma",
                         "ba", "ms", "phd", "java", "python", "bsc", "msc", "mca",
                         "linkedin", "github", "avenue", "redmond", "street",
                         "road", "lane", "nagar", "sector", "block", "phase"}
        for ent in nlp_doc.ents:
            if ent.label_ == "GPE":
                loc = ent.text.strip()
                if loc.lower() not in gpe_blacklist and len(loc) > 2:
                    return loc.title()
    except:
        pass

    # Strategy 5: Full text scan (last resort)
    for city in TIER1_CITIES:
        if city in text_lower:
            return city.title()
    for city in TIER2_CITIES:
        if city in text_lower:
            return city.title()

    return "Not Found"


def extract_education(text_lower: str) -> str:
    """Extract highest education level from text."""
    alpha = re.sub(r'[^a-z0-9\s]', ' ', text_lower)
    alpha = re.sub(r'\s+', ' ', alpha)

    if re.search(r'\b(ph\s*d|phd|doctorate|doctor of)\b', alpha):
        return "Doctorate / PhD"
    if re.search(r'\b(master|masters|m\s?tech|mtech|m\s?s\s?c|msc|m\s?c\s?a|mca|m\s?b\s?a|mba|m\s?com|mcom|p\s?g\s?d\s?m|pgdm)\b', alpha):
        return "Master's Degree / PG"
    if re.search(r'\b(bachelor|bachelors|b\s?tech|btech|b\s?s\s?c|bsc|b\s?c\s?a|bca|b\s?b\s?a|bba|b\s?com|bcom|b\s?e\b)\b', alpha):
        return "Bachelor's Degree"
    if re.search(r'\b(diploma|polytechnic)\b', alpha):
        return "Diploma"
    if re.search(r'\b(degree|graduate|graduation|university|engineering)\b', alpha):
        return "Degree (Unspecified)"
    return "Not Found"


def extract_experience(text_lower: str) -> list:
    """Extract experience: explicit years → intern check → date-range calc → fresher."""
    experience_arr = []

    # Method 1: Explicit "X years/yrs of experience"
    m = re.search(r'(\d+)\s*\+?\s*(?:years?|yrs?)(?:\s+of\s+experience)?', text_lower)
    if m and int(m.group(1)) > 0:
        experience_arr.append(f"{m.group(1)} Years")
        return experience_arr

    # Method 2: Explicit "X months"
    m = re.search(r'(\d+)\s*(?:months?|mos?)(?:\s+of\s+experience)?', text_lower)
    if m:
        months = int(m.group(1))
        if months >= 12:
            experience_arr.append(f"{months // 12} Years")
        elif months > 0:
            experience_arr.append(f"{months} Months")
        return experience_arr

    # Method 3: Intern/trainee keyword → short-circuit
    if re.search(r'\b(intern\b|internship|trainee|apprentice)', text_lower):
        experience_arr.append("Internship / < 1 Year")
        return experience_arr

    # Method 4: Calculate from date ranges in WORK EXPERIENCE section only
    # First, try to isolate work experience section
    work_section = text_lower
    work_start = re.search(r'\b(work\s+experience|experience|employment|career)\b', text_lower)
    work_end = re.search(r'\b(education|certif|skill|project|award|achievement)\b',
                         text_lower[work_start.end():] if work_start else "")
    if work_start:
        end_pos = work_start.end() + work_end.start() if work_end else len(text_lower)
        work_section = text_lower[work_start.start():end_pos]

    date_ranges = re.findall(
        r'((?:19|20)\d{2})\s*[-–—]+\s*(present|current|now|(?:19|20)\d{2})', work_section)

    if date_ranges:
        current_year = datetime.now().year
        max_calc = 0
        for start_str, end_str in date_ranges:
            try:
                start_yr = int(start_str)
                end_yr = current_year if end_str in ['present', 'current', 'now'] else int(end_str)
                if end_yr >= start_yr and (end_yr - start_yr) <= 20:
                    max_calc = max(max_calc, end_yr - start_yr)
            except:
                pass
        if max_calc > 0:
            experience_arr.append(f"~{max_calc} Years (Calculated)")
            return experience_arr

    experience_arr.append("Fresher")
    return experience_arr


def extract_skills(raw_text: str) -> list:
    """Extract skills with OCR-aware preprocessing."""
    text = raw_text.lower()

    # Apply OCR skill fixes
    for bad, good in OCR_SKILL_FIXES.items():
        text = text.replace(bad, good)

    found = set()
    for skill in KNOWN_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text):
            found.add(skill)

    # Normalize duplicates
    if "elasticsearch" in found:
        found.discard("elastic search")

    return sorted(list(found))


# ═══════════════════════════════════════════════════════════════════════════
# 4. MAIN RESUME PROCESSOR
# ═══════════════════════════════════════════════════════════════════════════

def process_single_resume(file_path: str, filename: str) -> dict:
    global global_nlp
    try:
        if os.path.getsize(file_path) == 0:
            return {"status": "failed", "filename": filename, "error": "File is empty"}

        raw_text, visual_name, is_pdf = get_text_from_file(file_path, filename)

        if not raw_text.strip():
            return {"status": "failed", "filename": filename, "error": "No text found"}

        # ── Extract each field ──
        email = extract_email(raw_text)
        phone = extract_phone(raw_text)
        location = extract_location(raw_text)

        clean_text = re.sub(r'\s+', ' ', raw_text)
        text_lower = clean_text.lower()

        education = extract_education(text_lower)
        experience = extract_experience(text_lower)
        skills = extract_skills(raw_text)

        # Profile picture
        if is_pdf:
            doc = fitz.open(file_path)
            profile_pic_path = extract_profile_picture_pdf(doc, filename)
            doc.close()
        else:
            profile_pic_path = extract_face_from_image(file_path, filename)

        # ── Name: visual → NLP → email fallback ──
        if not visual_name or len(visual_name.strip()) < 3:
            nlp_doc = global_nlp(clean_text[:500])
            persons = [ent.text.strip().title() for ent in nlp_doc.ents if ent.label_ == "PERSON"]
            if persons:
                visual_name = persons[0]
            elif email != "Not Found":
                visual_name = re.sub(r'[0-9._\-]', ' ', email.split('@')[0]).strip().title()
            else:
                visual_name = "Unknown Candidate"

        vw = visual_name.split()
        if len(vw) > 3:
            visual_name = f"{vw[0]} {vw[1]} {vw[2]}"

        return {
            "status": "success",
            "filename": filename,
            "data": {
                "name": visual_name,
                "email": email,
                "phone": phone,
                "location": location,
                "education": education,
                "experience": experience,
                "skills": skills,
                "profile_pic": profile_pic_path,
                "status": "Processed"
            }
        }
    except Exception as e:
        logging.error(f"Exception processing {filename}: {str(e)}")
        return {"status": "failed", "filename": filename, "error": str(e)}
    finally:
        gc.collect()


# ═══════════════════════════════════════════════════════════════════════════
# 5. PIPELINE ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════════════

def run_ats_pipeline(expected_skills=None, job_id=None, job_description=None):
    if expected_skills is None:
        expected_skills = []
    TARGET_FOLDER = "resumes_to_process"
    PROCESSED_FOLDER = "archive/processed"
    FAILED_FOLDER = "archive/failed"
    PICS_FOLDER = "archive/profile_pics"
    JSON_OUTPUT_FILE = "candidates_data.json"

    for folder in [TARGET_FOLDER, PROCESSED_FOLDER, FAILED_FOLDER, PICS_FOLDER]:
        os.makedirs(folder, exist_ok=True)

    files = [f for f in os.listdir(TARGET_FOLDER) if f.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg'))]
    if not files:
        print(f"\n[!] Folder '{TARGET_FOLDER}' is empty.")
        return

    optimal_threads = calculate_optimal_threads(len(files))
    print(f"\n [Start] Enterprise Pipeline: Processing {len(files)} files with {optimal_threads} threads...")

    extracted_candidates_data = []

    with ThreadPoolExecutor(max_workers=optimal_threads) as executor:
        futures = {executor.submit(process_single_resume, os.path.join(TARGET_FOLDER, f), f): f for f in files}

        for future in as_completed(futures):
            result = future.result()
            filename = result['filename']
            file_path = os.path.join(TARGET_FOLDER, filename)

            if result['status'] == 'success':
                d = result['data']
                d["filename"] = filename
                if job_id:
                    d["job_id"] = job_id

                # Calculate Match Score
                cand_skills = d.get('skills', [])
                if isinstance(cand_skills, str):
                    try:
                        cand_skills = json.loads(cand_skills)
                    except:
                        cand_skills = []
                        
                # Extract skills from JD if provided
                jd_skills = set()
                if job_description:
                    import re
                    clean_jd = re.sub(r'<[^>]+>', ' ', job_description).lower()
                    for k_skill in KNOWN_SKILLS:
                        if re.search(r'\b' + re.escape(k_skill) + r'\b', clean_jd):
                            jd_skills.add(k_skill)

                cand_set = set(str(s).lower().strip() for s in cand_skills)
                manual_exp_set = set(str(s).lower().strip() for s in expected_skills if str(s).strip())
                exp_set = manual_exp_set.union(jd_skills)

                if len(exp_set) > 0:
                    matched = cand_set.intersection(exp_set)
                    # Slightly boost if they have many expected skills, but strictly cap at 100
                    base_score = (len(matched) / len(exp_set)) * 100
                    # Add small bump per matched skill
                    bonus = len(matched) * 2 
                    score = int(min(base_score + bonus, 100))
                    d["match_score"] = score
                else:
                    # If no expected skills, generate a random impressive score like before or base it on total skills
                    d["match_score"] = min(len(cand_set) * 5, 85)

                with db_lock:
                    extracted_candidates_data.append(d)

                shutil.move(file_path, os.path.join(PROCESSED_FOLDER, filename))
                print(f"    [Success] {filename}")
            else:
                logging.error(f"Extraction failed for {filename}: {result['error']}")
                shutil.move(file_path, os.path.join(FAILED_FOLDER, filename))
                print(f"    [Error] {filename} -> {result['error']}")

    with open(JSON_OUTPUT_FILE, 'w', encoding='utf-8') as json_file:
        json.dump(extracted_candidates_data, json_file, indent=4)

    print(f"\n [Success] Pipeline Complete! {len(extracted_candidates_data)} candidates -> {JSON_OUTPUT_FILE}")


if __name__ == "__main__":
    run_ats_pipeline()