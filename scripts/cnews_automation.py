#!/usr/bin/env python3
"""Cueism Cnews Automation - Monthly Round-up + Weekly Bonus Story
Uses only Python standard library - no external dependencies needed."""

import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import re
import os
import tempfile
import base64
from datetime import datetime, timedelta
from html.parser import HTMLParser

# --- Config ---
WP_URL = "https://cueism.com"
WP_USER = "admin"
WP_APP_PASS = "LHvI khMT 0PsK Go1v WTur 7pyB"  # WordPress app password with spaces
WP_API = f"{WP_URL}/wp-json/wp/v2"
NEWS_CATEGORY = 51
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

RSS_FEEDS = {
    "azbilliards": "https://www.azbilliards.com/feed/",
    "wpbsa": "https://wpbsa.com/feed/",
    "matchroom": "https://www.matchroompool.com/feed/",
    "probilliard": "https://probilliardseries.com/feed/",
    "wpa": "https://wpa-pool.com/feed/",
    "aebf": "https://aebf.eu/feed/",
}

ATOM_NS = "{http://www.w3.org/2005/Atom}"
MEDIA_NS = "{http://search.yahoo.com/mrss/}"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"

def fetch(url, timeout=15):
    """Fetch URL content."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"Fetch error {url}: {e}")
        return None

def parse_rss(url):
    """Parse RSS/Atom feed, return list of entries."""
    data = fetch(url)
    if not data:
        return []
    entries = []
    try:
        root = ET.fromstring(data)
        # RSS 2.0
        for item in root.findall(".//item"):
            entry = {}
            title = item.find("title")
            entry["title"] = title.text if title is not None else ""
            link = item.find("link")
            entry["link"] = link.text if link is not None else ""
            desc = item.find("description")
            entry["summary"] = strip_html(desc.text) if desc is not None and desc.text else ""
            pub = item.find("pubDate")
            entry["pub_date"] = pub.text if pub is not None else ""
            # Image: media:content
            media = item.find(f"{MEDIA_NS}content")
            if media is not None:
                entry["image"] = media.get("url")
            else:
                # Try enclosure
                enc = item.find("enclosure")
                if enc is not None:
                    entry["image"] = enc.get("url")
                else:
                    # Try to find img in description
                    entry["image"] = extract_img_from_html(entry["summary"])
            entries.append(entry)
        # Atom
        for entry_el in root.findall(f".//{ATOM_NS}entry"):
            entry = {}
            title = entry_el.find(f"{ATOM_NS}title")
            entry["title"] = title.text if title is not None else ""
            link_el = entry_el.find(f"{ATOM_NS}link")
            entry["link"] = link_el.get("href", "") if link_el is not None else ""
            summary = entry_el.find(f"{ATOM_NS}summary")
            entry["summary"] = strip_html(summary.text) if summary is not None and summary.text else ""
            updated = entry_el.find(f"{ATOM_NS}updated")
            entry["pub_date"] = updated.text if updated is not None else ""
            entry["image"] = None
            entries.append(entry)
    except ET.ParseError as e:
        print(f"XML parse error: {e}")
    return entries

def strip_html(text):
    """Remove HTML tags from text."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", "", text)
    return clean.strip()

def extract_img_from_html(html):
    """Extract first image URL from HTML string."""
    if not html:
        return None
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    return match.group(1) if match else None

def fetch_article_page(url):
    """Fetch article page for better content and images."""
    html = fetch(url)
    if not html:
        return {"description": "", "image": None, "body": None}
    # Get og:image
    match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html)
    if not match:
        match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html)
    og_image = match.group(1) if match else None
    # Get meta description
    match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', html)
    if not match:
        match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', html)
    desc = match.group(1) if match else ""
    return {"description": desc, "image": og_image, "body": None}

def download_image(url, filename):
    """Download image to temp file, return path or None."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content_type = resp.headers.get("Content-Type", "")
            if not content_type.startswith("image/"):
                return None
            data = resp.read()
            ext = "jpg"
            if "png" in content_type:
                ext = "png"
            elif "webp" in content_type:
                ext = "webp"
            tmp = tempfile.NamedTemporaryFile(suffix=f"_{filename}.{ext}", delete=False)
            tmp.write(data)
            tmp.close()
            return tmp.name
    except Exception as e:
        print(f"Image download error: {e}")
        return None

def upload_image_to_wp(image_path, title):
    """Upload image to WordPress media library, return media ID or None."""
    auth = base64.b64encode(f"{WP_USER}:{WP_APP_PASS}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Disposition": f'attachment; filename="{title}.jpg"',
        "Content-Type": "image/jpeg",
        "User-Agent": "curl/8.7.1",
    }
    try:
        with open(image_path, "rb") as f:
            data = f.read()
        req = urllib.request.Request(f"{WP_API}/media", data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            return result.get("id")
    except Exception as e:
        print(f"Image upload failed: {e}")
        return None

def create_post(title, content, image_ids=None, status="draft"):
    """Create a WordPress post."""
    auth = base64.b64encode(f"{WP_USER}:{WP_APP_PASS}".encode()).decode()
    payload = {
        "title": title,
        "content": content,
        "categories": [NEWS_CATEGORY],
        "status": status,
    }
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json",
        "User-Agent": "curl/8.7.1",
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{WP_API}/posts", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            post_id = result.get("id")
            if post_id and image_ids:
                # Set featured image
                meta_payload = {"meta": {"_thumbnail_id": image_ids[0]}}
                meta_data = json.dumps(meta_payload).encode()
                meta_headers = {
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/json",
                    "User-Agent": "curl/8.7.1",
                }
                meta_req = urllib.request.Request(
                    f"{WP_API}/posts/{post_id}", data=meta_data, headers=meta_headers, method="POST"
                )
                try:
                    urllib.request.urlopen(meta_req, timeout=15)
                except:
                    pass
            return post_id
    except Exception as e:
        print(f"Post creation failed: {e}")
        return None

def parse_date(date_str):
    """Parse RSS date string to datetime."""
    if not date_str:
        return None
    formats = [
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %H%M",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None

def scrape_feeds(days=30):
    """Scrape all RSS feeds, return articles from the last N days."""
    cutoff = datetime.now().replace(tzinfo=None) - timedelta(days=days)
    articles = []
    for source, url in RSS_FEEDS.items():
        print(f"  Scraping {source}...")
        entries = parse_rss(url)
        for entry in entries:
            pub_date = parse_date(entry.get("pub_date", ""))
            if pub_date:
                pub_date = pub_date.replace(tzinfo=None)
            if pub_date and pub_date < cutoff:
                continue
            articles.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "source": source,
                "published": pub_date.strftime("%Y-%m-%d") if pub_date else "",
                "summary": entry.get("summary", ""),
                "image": entry.get("image"),
            })
    return sorted(articles, key=lambda x: x["published"] or "", reverse=True)

def generate_monthly_roundup(articles):
    """Generate monthly round-up post from top articles."""
    month = datetime.now().strftime("%B %Y")
    title = f"Monthly Billiard News Round-Up {month}"
    intro = f"<p>Welcome to your monthly round-up of the biggest stories in the world of billiards and pool. Here are the top stories from {month} that every player should know about.</p>"
    
    stories_html = ""
    image_ids = []
    
    for i, art in enumerate(articles[:5], 1):
        page = fetch_article_page(art["link"])
        img_url = art["image"] or page.get("image")
        
        img_id = None
        if img_url:
            print(f"  Downloading image for story {i}...")
            img_path = download_image(img_url, f"story{i}")
            if img_path:
                img_id = upload_image_to_wp(img_path, f"story{i}_{month}")
                if img_id:
                    image_ids.append(img_id)
                    print(f"  Image uploaded (ID: {img_id})")
        
        excerpt = page.get("description") or art.get("summary", "")[:300]
        
        story = f"<h2>{art['title']}</h2>"
        if img_id:
            story += f'[caption id="attachment_{img_id}" align="aligncenter" width="800"][/caption]\n'
        story += f"<p>{excerpt}</p>"
        story_link = art['link']
        story_source = art['source'].title()
        story += f'<p><a href="{story_link}" target="_blank" rel="noopener">Read the full story at {story_source}</a></p>'
        if i < 5:
            story += "<hr>"
        stories_html += story
    
    content = intro + stories_html
    content += "<p><em>What story caught your eye? Let us know in the comments.</em></p>"
    return title, content, image_ids

def generate_weekly_bonus(articles):
    """Generate weekly bonus story post."""
    if not articles:
        return None, None, None
    art = articles[0]
    page = fetch_article_page(art["link"])
    title = art["title"]
    
    img_url = art["image"] or page.get("image")
    img_id = None
    if img_url:
        print("  Downloading bonus story image...")
        img_path = download_image(img_url, "bonus")
        if img_path:
            img_id = upload_image_to_wp(img_path, "bonus_weekly")
            if img_id:
                print(f"  Image uploaded (ID: {img_id})")
    
    excerpt = page.get("description") or art.get("summary", "")[:500]
    content = f"<p>This week's standout story in the billiard world comes from {art['source'].title()}:</p>"
    if img_id:
        content += f'[caption id="attachment_{img_id}" align="aligncenter" width="800"][/caption]\n'
    content += f"<h2>{title}</h2>"
    content += f"<p>{excerpt}</p>"
    content += f'<p><a href="{art["link"]}" target="_blank" rel="noopener">Read the full story at {art["source"].title()}</a></p>'
    content += "<p><em>What did you think of this story? Share your thoughts below.</em></p>"
    return title, content, [img_id] if img_id else []

def main(mode="monthly"):
    """Main entry point."""
    days = 30 if mode == "monthly" else 7
    print(f"[Cnews] Scraping feeds for {mode} round-up (last {days} days)...")
    articles = scrape_feeds(days=days)
    
    if not articles:
        print("[Cnews] No new articles found.")
        return
    
    print(f"[Cnews] Found {len(articles)} articles.")
    
    if mode == "monthly":
        title, content, image_ids = generate_monthly_roundup(articles)
    else:
        title, content, image_ids = generate_weekly_bonus(articles)
    
    if not title:
        print("[Cnews] Failed to generate content.")
        return
    
    print(f"[Cnews] Creating post: {title}")
    post_id = create_post(title, content, image_ids, status="draft")
    
    if post_id:
        print(f"[Cnews] Post created successfully! ID: {post_id}")
        print(f"[Cnews] URL: {WP_URL}/?p={post_id}")
    else:
        print("[Cnews] Failed to create post.")

if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "monthly"
    main(mode)
