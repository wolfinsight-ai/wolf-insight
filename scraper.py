import os
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from supabase import create_client

requests.packages.urllib3.disable_warnings()

# Initialize Gemini and Supabase from GitHub Secrets
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

class PersonaImpact(BaseModel):
    investor_family_office: str
    renewable_startup: str
    biogas_operator: str
    corporate_strategy: str

class AmendmentDiff(BaseModel):
    is_amendment: bool
    previous_rule: str
    new_rule: str

class PolicyIntelligence(BaseModel):
    title: str
    source: str
    sector: str
    policy_type: str
    executive_summary: list[str]
    relevance_score: int
    persona_impacts: PersonaImpact
    amendment_diff: AmendmentDiff

def fetch_mnre_notices(limit=4):
    url = "https://mnre.gov.in/en/notice-category/notifications/"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers, timeout=20, verify=False)
    soup = BeautifulSoup(res.text, "html.parser")
    notices = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        text = link.get_text(strip=True)
        if text and len(text) > 20 and (".pdf" in href.lower() or "notice" in href.lower()):
            full_url = urljoin(url, href)
            if not any(n["url"] == full_url for n in notices):
                notices.append({"title": text, "url": full_url, "source": "MNRE"})
        if len(notices) >= limit:
            break
    return notices

def already_exists(url):
    res = supabase.table("policies").select("id").eq("source_url", url).execute()
    return len(res.data) > 0

def process_notice(notice):
    if already_exists(notice["url"]):
        print(f"Skipping existing: {notice['title'][:50]}")
        return

    prompt = f"""
    Analyze this Indian renewable energy government notice for Wolf Insights:
    Source: {notice['source']}
    Title: {notice['title']}
    URL: {notice['url']}
    Provide a 3-bullet executive summary (under 15 words per bullet), sector, policy type, 
    relevance score (1-100), amendment comparison, and specific business impacts for each persona.
    """
    contents = [prompt]
    temp_pdf = None

    if notice["url"].lower().endswith(".pdf"):
        try:
            pdf_res = requests.get(notice["url"], timeout=25, verify=False)
            temp_pdf = "temp.pdf"
            with open(temp_pdf, "wb") as f:
                f.write(pdf_res.content)
            contents.append(client.files.upload(file=temp_pdf))
        except Exception as e:
            print(f"PDF download skipped: {e}")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PolicyIntelligence,
            temperature=0.2,
        ),
    )

    if temp_pdf and os.path.exists(temp_pdf):
        os.remove(temp_pdf)

    data = json.loads(response.text)
    data["source_url"] = notice["url"]
    supabase.table("policies").insert(data).execute()
    print(f"Inserted: {data['title'][:50]}")

if __name__ == "__main__":
    for item in fetch_mnre_notices(limit=4):
        try:
            process_notice(item)
            time.sleep(2)
        except Exception as e:
            print(f"Error on {item['title'][:30]}: {e}")
