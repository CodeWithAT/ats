import json
data = json.load(open('candidates_data.json'))
with open('_results_summary.txt', 'w', encoding='utf-8') as f:
    for d in data:
        fn = d.get('filename','')
        name = d.get('name','')
        email = d.get('email','')
        loc = d.get('location','')
        exp = d.get('experience',['?'])[0]
        f.write(f"{fn}\n  name={name}, email={email}\n  loc={loc}, exp={exp}\n\n")
print("Done")
