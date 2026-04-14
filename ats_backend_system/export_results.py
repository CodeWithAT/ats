import json
import csv
import os

def generate_vishesh_report():
    json_path = 'candidates_data.json'
    
    if not os.path.exists(json_path):
        print("No candidates found (JSON missing). Run main.py first!")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            candidates = json.load(f)
            
        if not candidates:
            print("No candidates found in the JSON file. Run main.py first!")
            return

        # 2. Print a clean summary to the Terminal for immediate proof
        print("\n" + "="*50)
        print(" [Start] ATS EXTRACTION RESULTS (BACKEND ONLY) ")
        print("="*50)
        
        rows = []
        for c in candidates:
            filename = c.get('filename', 'Unknown')
            name = c.get('name', 'Unknown')
            email = c.get('email', 'Not Found')
            phone = c.get('phone', 'Not Found')
            location = c.get('location', 'Not Found')
            
            exp_list = c.get('experience', [])
            experience = exp_list[0] if isinstance(exp_list, list) and exp_list else 'Fresher'
            
            education = c.get('education', 'Not Found')
            
            skills_list = c.get('skills', [])
            skills = ", ".join(skills_list) if isinstance(skills_list, list) else str(skills_list)
            
            match_score = c.get('match_score', 0) # Could be absent mapped 0
            status = c.get('status', 'Processed')

            rows.append([name, email, phone, location, experience, education, skills, match_score, status, filename])

            print(f"File:       {filename}")
            print(f"Name:       {name}")
            print(f"Email:      {email}")
            print(f"Experience: {experience}")
            print(f"Education:  {education}")
            print(f"Score:      {match_score}% Match")
            print("-" * 50)

        # 3. Export to an Excel-friendly CSV file
        csv_filename = 'vishesh_report.csv'
        with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            # Write the column headers
            writer.writerow(['Name', 'Email', 'Phone', 'Location', 'Experience', 'Education', 'Skills', 'Match Score', 'Status', 'Filename'])
            # Write all the data
            writer.writerows(rows)

        print(f"\n [Success] Successfully exported {len(rows)} processed profiles!")
        print(f" [Folder] A new file named '{csv_filename}' has been created in your folder.")
        print(" [Tip] Tell Vishesh he can open this CSV file directly in Microsoft Excel.")

    except Exception as e:
        print(f"Error reading JSON: {e}")

if __name__ == "__main__":
    generate_vishesh_report()