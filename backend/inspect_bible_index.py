import urllib.request, re

url = 'https://www.wordproject.org/bibles/tel/index.htm'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=30) as resp:
    html = resp.read().decode('utf-8', errors='replace')

# Save page to local file for inspection
with open('backend/inspect_bible_index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# print snippets around tel links
pattern = re.compile(r'<a[^>]+href=["\']([^"\']*tel[^"\']*)["\'][^>]*>([^<]+)</a>', re.IGNORECASE)
print('FOUND', len(pattern.findall(html)))
for m in pattern.finditer(html):
    print('HREF:', m.group(1), 'TEXT:', m.group(2))

print('--- BOOK LINKS ---')
for m in re.finditer(r'<a[^>]+href=["\'](?:\.{0,2}/)?tel/(\d{2})/1\.htm["\'][^>]*>([^<]+)</a>', html):
    print('ID', m.group(1), 'TEXT', m.group(2))
print('--- DONE ---')
