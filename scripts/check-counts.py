#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json

api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA"

providers = ["Xfinity", "Metronet", "Cox", "Verizon Fios", "CenturyLink", "Spectrum", "AT&T", "T-Mobile", "Frontier", "WOW!", "Starlink", "Viasat", "Google Fiber"]

print("=== PROVIDERS WITH BROADBAND LABELS ===")
total = 0
for provider in providers:
    url = f"https://aogfhlompvfztymxrxfm.supabase.co/rest/v1/broadband_plans?provider_name=eq.{urllib.parse.quote(provider)}&select=id"
    req = urllib.request.Request(url)
    req.add_header("apikey", api_key)
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Range", "0-0")
    req.add_header("Prefer", "count=exact")
    with urllib.request.urlopen(req) as response:
        content_range = response.headers.get("Content-Range")
        count = int(content_range.split("/")[1]) if content_range else 0
        if count > 0:
            print(f"  ✅ {provider}: {count:,}")
            total += count

print(f"\nTotal: {total:,} plans")
