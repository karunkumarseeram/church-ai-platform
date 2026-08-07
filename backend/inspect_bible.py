import urllib.request
import re

base_url = 'https://www.wordproject.org/bibles/tel'
book_id = '01'
chapter = '1'
url = f'{base_url}/{book_id}/{chapter}.htm'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=30) as resp:
    html = resp.read().decode('utf-8', errors='replace')

print('URL', url)
print('LEN', len(html))

# write to local file for easier manual inspection if needed
with open('backend/inspect_bible_chapter.html', 'w', encoding='utf-8') as f:
    f.write(html)

# print a window around the core content section
start = html.find('<body')
end = html.find('</body>')
print('BODY start', start, 'end', end)
if start != -1 and end != -1:
    snippet = html[start:end][:6000]
    print(snippet)

# extract all verses-looking lines
# The site may put verse numbers inline. We'll print the first 20 occurrences of digits followed by Telugu text.
for m in re.finditer(r'(\d+)\s*([^<\n]+)', html):
    text = m.group(2).strip()
    if len(text) > 20 and any(ch.isalpha() for ch in text):
        print('VERSE:', m.group(1), text[:120])
        break
