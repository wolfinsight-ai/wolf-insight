import os
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_sitemap():
    base_url = "https://wolps.com"
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    static_pages = ["", "/about", "/search"]
    for page in static_pages:
        xml_content += f"  <url>\n    <loc>{base_url}{page}</loc>\n    <changefreq>daily</changefreq>\n  </url>\n"
    
    response = supabase.table("policies").select("slug, updated_at").execute()
    
    if response.data:
        for item in response.data:
            slug = item.get("slug")
            updated_at = item.get("updated_at", "")[:10]
            xml_content += f"  <url>\n    <loc>{base_url}/policy/{slug}</loc>\n"
            if updated_at:
                xml_content += f"    <lastmod>{updated_at}</lastmod>\n"
            xml_content += f"    <changefreq>weekly</changefreq>\n  </url>\n"
            
    xml_content += '</urlset>'
    
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(xml_content)
    print("Sitemap generated!")

if __name__ == "__main__":
    generate_sitemap()
