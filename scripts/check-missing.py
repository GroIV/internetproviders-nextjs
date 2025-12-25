#!/usr/bin/env python3
import urllib.request
import json

api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA"

def get_data(table, params="", limit=1000):
    url = f"https://aogfhlompvfztymxrxfm.supabase.co/rest/v1/{table}?{params}&limit={limit}"
    req = urllib.request.Request(url)
    req.add_header("apikey", api_key)
    req.add_header("Authorization", f"Bearer {api_key}")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

# Get unique provider names from broadband_plans
plans = get_data("broadband_plans", "select=provider_name", 100000)
plan_providers = {}
for p in plans:
    name = p['provider_name']
    plan_providers[name] = plan_providers.get(name, 0) + 1

print("=== PROVIDERS WITH BROADBAND LABELS ===")
for name, count in sorted(plan_providers.items(), key=lambda x: -x[1]):
    print(f"  ✅ {name}: {count:,} plans")

print(f"\nTotal: {sum(plan_providers.values()):,} plans")

# Major US ISPs we should try to get
print("\n=== MAJOR ISPs MISSING LABELS ===")
have = set(p.lower() for p in plan_providers.keys())
missing = [
    ("Verizon Fios", "Major fiber provider, #3 in US"),
    ("Cox", "Only has PNG images, not machine-readable"),
    ("CenturyLink/Lumen/Quantum", "Website requires JS rendering"),
    ("Optimum/Altice", "Northeast cable provider"),
    ("Mediacom", "Midwest cable provider"),
    ("Windstream/Kinetic", "DSL/Fiber in rural areas"),
    ("Brightspeed", "Spun off from Lumen"),
    ("Breezeline", "Former Atlantic Broadband"),
    ("Ziply Fiber", "Northwest fiber provider"),
    ("Consolidated/Fidium", "New England fiber"),
    ("TDS Telecom", "Regional provider"),
    ("Sparklight", "Southwest cable"),
    ("Midco", "Upper Midwest"),
    ("EarthLink", "DSL reseller"),
    ("HughesNet", "Satellite provider"),
    ("Rise Broadband", "Fixed wireless"),
    ("Astound/RCN/Grande", "Regional cable"),
]

for name, note in missing:
    name_parts = name.lower().replace('/', ' ').split()
    if not any(part in ' '.join(have) for part in name_parts):
        print(f"  ❌ {name} - {note}")
