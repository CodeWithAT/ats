import fitz, re

doc = fitz.open('archive/processed/Riddhi updated freshh.pdf')
results = []
for page in doc:
    for block in page.get_text('dict').get('blocks', []):
        if block.get('type') == 0:
            for line in block.get('lines', []):
                line_text = ''
                line_size = 0
                for span in line.get('spans', []):
                    text = span.get('text', '').strip()
                    size = span.get('size', 0)
                    if text:
                        line_text += text + ' '
                        line_size = max(line_size, size)
                line_text = line_text.strip()
                if line_size > 10:
                    is_alpha = bool(re.match(r'^[A-Za-z\s.\-|]+$', line_text))
                    results.append(f'[{line_size:.1f}] alpha={is_alpha} "{line_text[:80]}"')

for r in results:
    print(r)
