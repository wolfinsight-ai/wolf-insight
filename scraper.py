import os
import requests
from bs4 import BeautifulSoup
from google import genai
from supabase import create_client

# Initialize Supabase & Gemini clients
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))
ai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def scrape_mnre():
    """Scrapes latest policies & orders from MNRE"""
    url = "https://mnre.gov.in/documents/orders-and-notices"
    policies = []
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Adjust selectors based on exact site DOM structure
            items = soup.find_all('a', class_='visibilityView') or soup.select('.card, tr')
            for item in items[:5]: # Grabbing latest entries
                title = item.get_text(strip=True)
                link = item.get('href', url)
                if title:
                    policies.append({
                        "title": title,
                        "source": "MNRE",
                        "url": link if link.startswith('http') else f"https://mnre.gov.in{link}",
                        "content": f"MNRE Policy update: {title}"
                    })
    except Exception as e:
        print(f"Error scraping MNRE: {e}")
    return policies

def scrape_cerc():
    """Scrapes latest regulations from CERC"""
    url = "https://cercind.gov.in/index-en.html"
    policies = []
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Extracting recent draft/final notifications
            notices = soup.find_all('a')
            for notice in notices:
                text = notice.get_text(strip=True)
                if "Regulations" in text or "Amendment" in text or "Tariff" in text:
                    link = notice.get('href', '')
                    policies.append({
                        "title": text,
                        "source": "CERC",
                        "url": link if link.startswith('http') else f"https://cercind.gov.in/{link}",
                        "content": f"CERC Regulatory update: {text}"
                    })
        # Limit to prevent overloading in a single run
        policies = policies[:5]
    except Exception as e:
        print(f"Error scraping CERC: {e}")
    return policies

def scrape_seci():
    """Scrapes latest tender notices from SECI"""
    url = "https://www.seci.co.in/" # Main SECI portal
    policies = []
    try:
        # Placeholder logic for SECI tenders/notices parsing
        # Add targeted requests and BeautifulSoup parsing rules here
        pass
    except Exception as e:
        print(f"Error scraping SECI: {e}")
    return policies

def analyze_with_gemini(policy_text):
    """Passes raw policy text through Gemini for instant business impact analysis"""
    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Analyze this Indian renewable energy policy/regulation. Provide a 2-sentence executive summary and key business impact for startup founders and IPP developers: {policy_text}"
        )
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "AI analysis unavailable."

def main():
    all_policies = []
    
    print("🚀 Starting multi-portal regulatory scrape...")
    
    print("Fetching MNRE policies...")
    all_policies.extend(scrape_mnre())
    
    print("Fetching CERC regulations...")
    all_policies.extend(scrape_cerc())
    
    print(f"Total policies harvested: {len(all_policies)}")
    
    # Process and upsert into Supabase securely
    for policy in all_policies:
        ai_summary = analyze_with_gemini(policy['content'])
        
        payload = {
            "title": policy['title'],
            "source": policy['source'],
            "url": policy['url'],
            "raw_content": policy['content'],
            "ai_summary": ai_summary
        }
        
        # Safe upsert using unique URL to prevent duplicate errors
        try:
            supabase.table("policies").upsert(payload, on_conflict="url").execute()
            print(f"Synced to DB: [{policy['source']}] {policy['title'][:40]}...")
        except Exception as db_err:
            print(f"Database upsert error: {db_err}")

if __name__ == "__main__":
    main()
