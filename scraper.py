import os
import requests
from bs4 import BeautifulSoup
from google import genai
from supabase import create_client

# Initialize Supabase & Gemini clients
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))
ai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Dictionary of State Electricity Regulatory Commissions (SERCs) & Central Portals
PORTALS = {
    "MNRE": "https://mnre.gov.in/",
    "CERC": "https://cercind.gov.in/index-en.html",
    "SECI": "https://www.seci.co.in/",
    "MERC (Maharashtra)": "https://www.merc.gov.in/",
    "GERC (Gujarat)": "https://gercin.org/",
    "UPERC (Uttar Pradesh)": "https://www.uperc.org/",
    "TNERC (Tamil Nadu)": "https://www.tnerc.gov.in/",
    "RERC (Rajasthan)": "https://rerc.rajasthan.gov.in/"
}

def scrape_portal(source_name, base_url):
    """Generic scraper function that handles any central or state regulatory portal"""
    policies = []
    try:
        response = requests.get(base_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a')
            
            for link_tag in links:
                title = link_tag.get_text(strip=True)
                href = link_tag.get('href', '')
                
                # Filter for high-relevance keywords in renewable energy/tariffs
                if title and any(kw in title for kw in ["Solar", "Tariff", "Regulation", "Policy", "Order", "Tender", "Amendment", "Guidelines"]):
                    if len(title) > 20: # Drop generic navigation items
                        full_url = href if href.startswith('http') else base_url.rstrip('/') + '/' + href.lstrip('/')
                        policies.append({
                            "title": title,
                            "source": source_name,
                            "url": full_url,
                            "content": f"[{source_name}] Regulatory Update: {title}"
                        })
        # Limit to latest 3 per portal to keep execution fast and clean
        return policies[:3]
    except Exception as e:
        print(f"Error scraping {source_name}: {e}")
        return []

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
    
    print("🚀 Starting nationwide regulatory harvest across Central & State portals...")
    
    # Loop through every configured central and state portal dynamically
    for source_name, url in PORTALS.items():
        print(f"Fetching from {source_name}...")
        portal_data = scrape_portal(source_name, url)
        all_policies.extend(portal_data)
    
    print(f"Total policies harvested nationwide: {len(all_policies)}")
    
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
        
        try:
            supabase.table("policies").upsert(payload, on_conflict="url").execute()
            print(f"Synced to DB: [{policy['source']}] {policy['title'][:40]}...")
        except Exception as db_err:
            print(f"Database upsert error: {db_err}")

if __name__ == "__main__":
    main()
