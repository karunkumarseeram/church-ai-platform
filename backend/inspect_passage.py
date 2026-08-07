import urllib.request
import re

url = 'https://www.wordproject.org/bibles/tel/01/1.htm'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=30) as resp:
    html = resp.read().decode('utf-8', errors='replace')

print('LEN', len(html))
for pattern in [r'<div[^>]+class=["\']textHeader["\']', r'class="chap"', r'<div[^>]+class=["\']ym-text', r'<p[^>]*>', r'<div[^>]+class=["\'][^"\']*text[^"\']*["\']']:
    print('---', pattern)
    for m in re.finditer(pattern, html):
        print(html[m.start():m.start()+200])
        break

# print a larger chunk around the main content area
marker = 'class="textHeader"'
idx = html.find(marker)
print('textHeader idx', idx)
if idx != -1:
    print(html[idx:idx+1200])

# print chunk around the section after all nav links
endnav = html.find('<div id="0" class="textAudio ym-noprint"')
print('textAudio idx', endnav)
if endnav != -1:
    print(html[endnav:endnav+1600])
