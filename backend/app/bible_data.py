import random
from datetime import datetime
from functools import lru_cache
from html.parser import HTMLParser
import html as html_module
import re
import urllib.request
from urllib.error import HTTPError, URLError

DAILY_VERSES = [
    {
        "reference": "John 3:16",
        "text": "For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life."
    },
    {
        "reference": "Psalm 23:1",
        "text": "The Lord is my shepherd; I shall not want."
    },
    {
        "reference": "Philippians 4:13",
        "text": "I can do all things through him who strengthens me."
    },
    {
        "reference": "Proverbs 3:5",
        "text": "Trust in the Lord with all your heart, and do not lean on your own understanding."
    },
    {
        "reference": "Romans 8:28",
        "text": "And we know that for those who love God all things work together for good, for those who are called according to his purpose."
    },
    {
        "reference": "Matthew 11:28",
        "text": "Come to me, all who labor and are heavy laden, and I will give you rest."
    },
    {
        "reference": "Psalm 119:105",
        "text": "Your word is a lamp to my feet and a light to my path."
    }
]

BIBLE_BOOKS = {
    "John": {
        1: [
            "In the beginning was the Word, and the Word was with God, and the Word was God.",
            "He was in the beginning with God.",
            "All things were made through him, and without him was not any thing made that was made.",
            "In him was life, and the life was the light of men.",
            "The light shines in the darkness, and the darkness has not overcome it."
        ],
        3: [
            "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
            "This man came to Jesus by night and said to him, 'Rabbi, we know that you are a teacher come from God.'",
            "Jesus answered him, 'Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God.'",
            "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
            "For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him."
        ]
    },
    "Psalm": {
        23: [
            "The Lord is my shepherd; I shall not want.",
            "He makes me lie down in green pastures. He leads me beside still waters.",
            "He restores my soul. He leads me in paths of righteousness for his name's sake.",
            "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.",
            "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows."
        ]
    },
    "Genesis": {
        1: [
            "In the beginning, God created the heavens and the earth.",
            "The earth was without form and void, and darkness was over the face of the deep.",
            "And God said, 'Let there be light,' and there was light.",
            "And God saw that the light was good. And God separated the light from the darkness.",
            "And God called the light Day, and the darkness he called Night."
        ]
    }
}

WORDPROJECT_BASE = "https://www.wordproject.org/bibles/tel"
USER_AGENT = "Mozilla/5.0 (compatible; ChurchAI/1.0)"


class WordProjectVerseParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_text_body = False
        self.current_verse = 1
        self.current_text = ""
        self.verses = []
        self.in_verse_span = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "div" and attrs.get("class") == "textBody" and attrs.get("id") == "textBody":
            self.in_text_body = True
            return
        if not self.in_text_body:
            return
        if tag == "span" and attrs.get("class") == "verse" and attrs.get("id"):
            if self.current_text.strip():
                self.verses.append({
                    "number": self.current_verse,
                    "text": re.sub(r"\s+", " ", self.current_text).strip()
                })
            try:
                self.current_verse = int(attrs["id"])
            except ValueError:
                self.current_verse += 1
            self.current_text = ""
            self.in_verse_span = True
        elif tag == "br":
            self.current_text += " "

    def handle_endtag(self, tag):
        if tag == "div" and self.in_text_body:
            self.in_text_body = False
            if self.current_text.strip():
                self.verses.append({
                    "number": self.current_verse,
                    "text": re.sub(r"\s+", " ", self.current_text).strip()
                })
        if tag == "span" and self.in_verse_span:
            self.in_verse_span = False

    def handle_data(self, data):
        if not self.in_text_body or self.in_verse_span:
            return
        self.current_text += data


def _fetch_html(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


@lru_cache(maxsize=1)
def _load_wordproject_book_index():
    try:
        html_text = _fetch_html(f"{WORDPROJECT_BASE}/index.htm")
    except (HTTPError, URLError):
        return []

    books = []
    for match in re.finditer(r'<a[^>]+href=["\']?(\d{2})/1\.htm["\']?[^>]*>([^<]+)</a>', html_text):
        book_id, book_name = match.group(1), html_module.unescape(match.group(2).strip())
        books.append((book_id, book_name))
    return books


def _load_random_online_passage():
    books = _load_wordproject_book_index()
    if not books:
        return None

    for _ in range(10):
        book_id, book_name = random.choice(books)
        chapters = get_chapters(book_name)
        if not chapters:
            continue

        chapter = random.choice(chapters)
        passage = get_passage(book_name, chapter)
        if passage:
            return book_name, chapter, passage

    return None


def get_daily_verse():
    online_passage = _load_random_online_passage()
    if online_passage:
        book_name, chapter, passage = online_passage
        verse = random.choice(passage)
        return {
            "reference": f"{book_name} {chapter}:{verse['number']}",
            "text": verse["text"],
        }

    return random.choice(DAILY_VERSES)


def get_books():
    books = [name for _, name in _load_wordproject_book_index()]
    if books:
        return books
    return sorted(BIBLE_BOOKS.keys())


def _get_book_id(book_name: str):
    for book_id, name in _load_wordproject_book_index():
        if name == book_name:
            return book_id
    return None


@lru_cache(maxsize=128)
def get_chapters(book_name: str):
    book_id = _get_book_id(book_name)
    if book_id is None:
        book = BIBLE_BOOKS.get(book_name)
        return sorted(book.keys()) if book else []

    try:
        html_text = _fetch_html(f"{WORDPROJECT_BASE}/{book_id}/1.htm")
    except (HTTPError, URLError):
        return []

    chapters = []
    current = re.search(r'<span[^>]+class=["\']chapread["\'][^>]*>(\d+)</span>', html_text)
    if current:
        chapters.append(int(current.group(1)))
    chapters += [int(ch) for ch in re.findall(r'<a[^>]+class=["\']chap["\'][^>]*>(\d+)</a>', html_text)]
    return list(dict.fromkeys(chapters))


@lru_cache(maxsize=256)
def get_passage(book_name: str, chapter: int):
    book_id = _get_book_id(book_name)
    if book_id is None:
        book = BIBLE_BOOKS.get(book_name)
        if not book:
            return None
        chapter_content = book.get(chapter)
        if not chapter_content:
            return None
        return [{"number": idx + 1, "text": text} for idx, text in enumerate(chapter_content)]

    try:
        html_text = _fetch_html(f"{WORDPROJECT_BASE}/{book_id}/{chapter}.htm")
    except (HTTPError, URLError):
        return None

    parser = WordProjectVerseParser()
    parser.feed(html_text)
    return parser.verses or None
