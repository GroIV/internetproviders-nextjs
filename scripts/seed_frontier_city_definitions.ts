/**
 * Seed city_definitions for all Frontier Fiber markets with ≥20% CBSA coverage
 *
 * For each target CBSA:
 * 1. Get ZIPs in CBSA from zip_cbsa_mapping
 * 2. Join to zip_broadband_coverage to get city + total_housing_units
 * 3. Pick ZIP with max housing units as representative
 * 4. Derive state from ZIP prefix
 * 5. Upsert into city_definitions
 *
 * Run with: npx tsx scripts/seed_frontier_city_definitions.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing environment variables');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ZIP code prefix to state mapping
// Based on USPS ZIP code assignments
const ZIP_PREFIX_TO_STATE: Record<string, { abbr: string; name: string; slug: string }> = {
  // Connecticut
  '06': { abbr: 'CT', name: 'Connecticut', slug: 'connecticut' },
  // Massachusetts
  '01': { abbr: 'MA', name: 'Massachusetts', slug: 'massachusetts' },
  '02': { abbr: 'MA', name: 'Massachusetts', slug: 'massachusetts' },
  // Rhode Island
  '028': { abbr: 'RI', name: 'Rhode Island', slug: 'rhode-island' },
  '029': { abbr: 'RI', name: 'Rhode Island', slug: 'rhode-island' },
  // New Hampshire
  '03': { abbr: 'NH', name: 'New Hampshire', slug: 'new-hampshire' },
  // Maine
  '039': { abbr: 'ME', name: 'Maine', slug: 'maine' },
  '04': { abbr: 'ME', name: 'Maine', slug: 'maine' },
  // Vermont
  '05': { abbr: 'VT', name: 'Vermont', slug: 'vermont' },
  // New Jersey
  '07': { abbr: 'NJ', name: 'New Jersey', slug: 'new-jersey' },
  '08': { abbr: 'NJ', name: 'New Jersey', slug: 'new-jersey' },
  // Puerto Rico
  '00': { abbr: 'PR', name: 'Puerto Rico', slug: 'puerto-rico' },
  // New York
  '10': { abbr: 'NY', name: 'New York', slug: 'new-york' },
  '11': { abbr: 'NY', name: 'New York', slug: 'new-york' },
  '12': { abbr: 'NY', name: 'New York', slug: 'new-york' },
  '13': { abbr: 'NY', name: 'New York', slug: 'new-york' },
  '14': { abbr: 'NY', name: 'New York', slug: 'new-york' },
  // Pennsylvania
  '15': { abbr: 'PA', name: 'Pennsylvania', slug: 'pennsylvania' },
  '16': { abbr: 'PA', name: 'Pennsylvania', slug: 'pennsylvania' },
  '17': { abbr: 'PA', name: 'Pennsylvania', slug: 'pennsylvania' },
  '18': { abbr: 'PA', name: 'Pennsylvania', slug: 'pennsylvania' },
  '19': { abbr: 'PA', name: 'Pennsylvania', slug: 'pennsylvania' },
  // Delaware
  '197': { abbr: 'DE', name: 'Delaware', slug: 'delaware' },
  '198': { abbr: 'DE', name: 'Delaware', slug: 'delaware' },
  '199': { abbr: 'DE', name: 'Delaware', slug: 'delaware' },
  // DC
  '20': { abbr: 'DC', name: 'District of Columbia', slug: 'district-of-columbia' },
  // Maryland / Virginia / West Virginia (overlapping prefixes)
  '21': { abbr: 'MD', name: 'Maryland', slug: 'maryland' },
  '22': { abbr: 'VA', name: 'Virginia', slug: 'virginia' },
  '23': { abbr: 'VA', name: 'Virginia', slug: 'virginia' },
  '24': { abbr: 'VA', name: 'Virginia', slug: 'virginia' },
  '25': { abbr: 'WV', name: 'West Virginia', slug: 'west-virginia' },
  '26': { abbr: 'WV', name: 'West Virginia', slug: 'west-virginia' },
  // North Carolina
  '27': { abbr: 'NC', name: 'North Carolina', slug: 'north-carolina' },
  '28': { abbr: 'NC', name: 'North Carolina', slug: 'north-carolina' },
  // South Carolina
  '29': { abbr: 'SC', name: 'South Carolina', slug: 'south-carolina' },
  // Georgia
  '30': { abbr: 'GA', name: 'Georgia', slug: 'georgia' },
  '31': { abbr: 'GA', name: 'Georgia', slug: 'georgia' },
  '398': { abbr: 'GA', name: 'Georgia', slug: 'georgia' },
  '399': { abbr: 'GA', name: 'Georgia', slug: 'georgia' },
  // Florida
  '32': { abbr: 'FL', name: 'Florida', slug: 'florida' },
  '33': { abbr: 'FL', name: 'Florida', slug: 'florida' },
  '34': { abbr: 'FL', name: 'Florida', slug: 'florida' },
  // Alabama
  '35': { abbr: 'AL', name: 'Alabama', slug: 'alabama' },
  '36': { abbr: 'AL', name: 'Alabama', slug: 'alabama' },
  // Tennessee
  '37': { abbr: 'TN', name: 'Tennessee', slug: 'tennessee' },
  '38': { abbr: 'TN', name: 'Tennessee', slug: 'tennessee' },
  // Mississippi
  '386': { abbr: 'MS', name: 'Mississippi', slug: 'mississippi' },
  '387': { abbr: 'MS', name: 'Mississippi', slug: 'mississippi' },
  '388': { abbr: 'MS', name: 'Mississippi', slug: 'mississippi' },
  '389': { abbr: 'MS', name: 'Mississippi', slug: 'mississippi' },
  '39': { abbr: 'MS', name: 'Mississippi', slug: 'mississippi' },
  // Kentucky
  '40': { abbr: 'KY', name: 'Kentucky', slug: 'kentucky' },
  '41': { abbr: 'KY', name: 'Kentucky', slug: 'kentucky' },
  '42': { abbr: 'KY', name: 'Kentucky', slug: 'kentucky' },
  // Ohio
  '43': { abbr: 'OH', name: 'Ohio', slug: 'ohio' },
  '44': { abbr: 'OH', name: 'Ohio', slug: 'ohio' },
  '45': { abbr: 'OH', name: 'Ohio', slug: 'ohio' },
  // Indiana
  '46': { abbr: 'IN', name: 'Indiana', slug: 'indiana' },
  '47': { abbr: 'IN', name: 'Indiana', slug: 'indiana' },
  // Michigan
  '48': { abbr: 'MI', name: 'Michigan', slug: 'michigan' },
  '49': { abbr: 'MI', name: 'Michigan', slug: 'michigan' },
  // Iowa
  '50': { abbr: 'IA', name: 'Iowa', slug: 'iowa' },
  '51': { abbr: 'IA', name: 'Iowa', slug: 'iowa' },
  '52': { abbr: 'IA', name: 'Iowa', slug: 'iowa' },
  // Wisconsin
  '53': { abbr: 'WI', name: 'Wisconsin', slug: 'wisconsin' },
  '54': { abbr: 'WI', name: 'Wisconsin', slug: 'wisconsin' },
  // Minnesota
  '55': { abbr: 'MN', name: 'Minnesota', slug: 'minnesota' },
  '56': { abbr: 'MN', name: 'Minnesota', slug: 'minnesota' },
  // South Dakota
  '57': { abbr: 'SD', name: 'South Dakota', slug: 'south-dakota' },
  // North Dakota
  '58': { abbr: 'ND', name: 'North Dakota', slug: 'north-dakota' },
  // Montana
  '59': { abbr: 'MT', name: 'Montana', slug: 'montana' },
  // Illinois
  '60': { abbr: 'IL', name: 'Illinois', slug: 'illinois' },
  '61': { abbr: 'IL', name: 'Illinois', slug: 'illinois' },
  '62': { abbr: 'IL', name: 'Illinois', slug: 'illinois' },
  // Missouri
  '63': { abbr: 'MO', name: 'Missouri', slug: 'missouri' },
  '64': { abbr: 'MO', name: 'Missouri', slug: 'missouri' },
  '65': { abbr: 'MO', name: 'Missouri', slug: 'missouri' },
  // Kansas
  '66': { abbr: 'KS', name: 'Kansas', slug: 'kansas' },
  '67': { abbr: 'KS', name: 'Kansas', slug: 'kansas' },
  // Nebraska
  '68': { abbr: 'NE', name: 'Nebraska', slug: 'nebraska' },
  '69': { abbr: 'NE', name: 'Nebraska', slug: 'nebraska' },
  // Louisiana
  '70': { abbr: 'LA', name: 'Louisiana', slug: 'louisiana' },
  '71': { abbr: 'LA', name: 'Louisiana', slug: 'louisiana' },
  // Arkansas
  '716': { abbr: 'AR', name: 'Arkansas', slug: 'arkansas' },
  '717': { abbr: 'AR', name: 'Arkansas', slug: 'arkansas' },
  '718': { abbr: 'AR', name: 'Arkansas', slug: 'arkansas' },
  '719': { abbr: 'AR', name: 'Arkansas', slug: 'arkansas' },
  '72': { abbr: 'AR', name: 'Arkansas', slug: 'arkansas' },
  // Oklahoma
  '73': { abbr: 'OK', name: 'Oklahoma', slug: 'oklahoma' },
  '74': { abbr: 'OK', name: 'Oklahoma', slug: 'oklahoma' },
  // Texas
  '75': { abbr: 'TX', name: 'Texas', slug: 'texas' },
  '76': { abbr: 'TX', name: 'Texas', slug: 'texas' },
  '77': { abbr: 'TX', name: 'Texas', slug: 'texas' },
  '78': { abbr: 'TX', name: 'Texas', slug: 'texas' },
  '79': { abbr: 'TX', name: 'Texas', slug: 'texas' },
  '885': { abbr: 'TX', name: 'Texas', slug: 'texas' },
  // Colorado
  '80': { abbr: 'CO', name: 'Colorado', slug: 'colorado' },
  '81': { abbr: 'CO', name: 'Colorado', slug: 'colorado' },
  // Wyoming
  '82': { abbr: 'WY', name: 'Wyoming', slug: 'wyoming' },
  '83': { abbr: 'WY', name: 'Wyoming', slug: 'wyoming' },
  // Idaho
  '832': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  '833': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  '834': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  '835': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  '836': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  '837': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  '838': { abbr: 'ID', name: 'Idaho', slug: 'idaho' },
  // Utah
  '84': { abbr: 'UT', name: 'Utah', slug: 'utah' },
  // Arizona
  '85': { abbr: 'AZ', name: 'Arizona', slug: 'arizona' },
  '86': { abbr: 'AZ', name: 'Arizona', slug: 'arizona' },
  // New Mexico
  '87': { abbr: 'NM', name: 'New Mexico', slug: 'new-mexico' },
  '88': { abbr: 'NM', name: 'New Mexico', slug: 'new-mexico' },
  // Nevada
  '889': { abbr: 'NV', name: 'Nevada', slug: 'nevada' },
  '89': { abbr: 'NV', name: 'Nevada', slug: 'nevada' },
  // California
  '90': { abbr: 'CA', name: 'California', slug: 'california' },
  '91': { abbr: 'CA', name: 'California', slug: 'california' },
  '92': { abbr: 'CA', name: 'California', slug: 'california' },
  '93': { abbr: 'CA', name: 'California', slug: 'california' },
  '94': { abbr: 'CA', name: 'California', slug: 'california' },
  '95': { abbr: 'CA', name: 'California', slug: 'california' },
  '96': { abbr: 'CA', name: 'California', slug: 'california' },
  // Washington
  '98': { abbr: 'WA', name: 'Washington', slug: 'washington' },
  '99': { abbr: 'WA', name: 'Washington', slug: 'washington' },
  // Oregon
  '97': { abbr: 'OR', name: 'Oregon', slug: 'oregon' },
  // Alaska
  '995': { abbr: 'AK', name: 'Alaska', slug: 'alaska' },
  '996': { abbr: 'AK', name: 'Alaska', slug: 'alaska' },
  '997': { abbr: 'AK', name: 'Alaska', slug: 'alaska' },
  '998': { abbr: 'AK', name: 'Alaska', slug: 'alaska' },
  '999': { abbr: 'AK', name: 'Alaska', slug: 'alaska' },
  // Hawaii
  '967': { abbr: 'HI', name: 'Hawaii', slug: 'hawaii' },
  '968': { abbr: 'HI', name: 'Hawaii', slug: 'hawaii' },
};

// Get state info from ZIP code
function getStateFromZip(zip: string): { abbr: string; name: string; slug: string } | null {
  // Try 3-digit prefix first (more specific)
  const prefix3 = zip.substring(0, 3);
  if (ZIP_PREFIX_TO_STATE[prefix3]) {
    return ZIP_PREFIX_TO_STATE[prefix3];
  }
  // Fall back to 2-digit prefix
  const prefix2 = zip.substring(0, 2);
  if (ZIP_PREFIX_TO_STATE[prefix2]) {
    return ZIP_PREFIX_TO_STATE[prefix2];
  }
  return null;
}

// Convert city name to slug
function cityToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '')           // Remove periods
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Spaces to hyphens
    .replace(/-+/g, '-')          // Collapse multiple hyphens
    .replace(/^-|-$/g, '')        // Trim hyphens
    .trim();
}

// Extract primary city from places string (may contain "City1; City2")
function extractPrimaryCity(places: string): string {
  if (!places) return '';
  // Take first city if semicolon-separated
  const primary = places.split(';')[0].trim();
  // Remove common suffixes like "city", "town" if at end
  return primary;
}

interface FrontierMarket {
  cbsa_code: string;
  coverage_pct: number;
}

interface ZipCityData {
  zip_code: string;
  city: string;
  total_housing_units: number;
}

interface CityDefinition {
  state_slug: string;
  state_abbr: string;
  city_slug: string;
  city_name: string;
  representative_zip: string;
  cbsa_code: string;
  is_major_city: boolean;
}

async function main() {
  console.log('='.repeat(70));
  console.log('Frontier Fiber City Definitions Seed Script');
  console.log('Target: All CBSAs with Frontier coverage ≥20%');
  console.log('='.repeat(70));

  // Step 1: Get all Frontier CBSA markets with ≥20% coverage
  console.log('\n[1/5] Querying Frontier markets from cbsa_top_providers_v1...');

  const { data: frontierMarkets, error: marketError } = await supabase
    .from('cbsa_top_providers_v1')
    .select('cbsa_code, coverage_pct')
    .eq('provider_slug', 'frontier-fiber')
    .gte('coverage_pct', 20)
    .order('coverage_pct', { ascending: false });

  if (marketError) {
    console.error('ERROR querying Frontier markets:', marketError.message);
    process.exit(1);
  }

  // Deduplicate by cbsa_code, keeping max coverage
  const cbsaMap = new Map<string, FrontierMarket>();
  for (const m of frontierMarkets || []) {
    const existing = cbsaMap.get(m.cbsa_code);
    if (!existing || m.coverage_pct > existing.coverage_pct) {
      cbsaMap.set(m.cbsa_code, { cbsa_code: m.cbsa_code, coverage_pct: m.coverage_pct });
    }
  }

  const targetCbsas = Array.from(cbsaMap.values());
  console.log(`Found ${targetCbsas.length} unique Frontier CBSA markets with ≥20% coverage`);

  if (targetCbsas.length === 0) {
    console.log('No Frontier markets found. Exiting.');
    process.exit(0);
  }

  // Step 2: For each CBSA, find the representative city
  console.log('\n[2/5] Resolving representative city for each CBSA...');

  const cityDefinitions: CityDefinition[] = [];
  const skippedCbsas: { cbsa_code: string; reason: string }[] = [];
  const seenCities = new Set<string>(); // Track state_slug + city_slug to avoid duplicates

  for (const market of targetCbsas) {
    // Get all ZIPs in this CBSA
    const { data: cbsaZips, error: zipError } = await supabase
      .from('zip_cbsa_mapping')
      .select('zip_code')
      .eq('cbsa_code', market.cbsa_code);

    if (zipError || !cbsaZips || cbsaZips.length === 0) {
      skippedCbsas.push({ cbsa_code: market.cbsa_code, reason: 'No ZIPs in zip_cbsa_mapping' });
      continue;
    }

    const zipCodes = cbsaZips.map(z => z.zip_code);

    // Get city and housing data for these ZIPs
    const { data: zipData, error: coverageError } = await supabase
      .from('zip_broadband_coverage')
      .select('zip_code, city, total_housing_units')
      .in('zip_code', zipCodes)
      .not('city', 'is', null)
      .order('total_housing_units', { ascending: false })
      .limit(1);

    if (coverageError || !zipData || zipData.length === 0) {
      skippedCbsas.push({ cbsa_code: market.cbsa_code, reason: 'No city data in zip_broadband_coverage' });
      continue;
    }

    const bestZip = zipData[0];
    const cityName = extractPrimaryCity(bestZip.city);

    if (!cityName) {
      skippedCbsas.push({ cbsa_code: market.cbsa_code, reason: 'Empty city name' });
      continue;
    }

    // Get state from ZIP
    const stateInfo = getStateFromZip(bestZip.zip_code);
    if (!stateInfo) {
      skippedCbsas.push({ cbsa_code: market.cbsa_code, reason: `Cannot resolve state for ZIP ${bestZip.zip_code}` });
      continue;
    }

    const citySlug = cityToSlug(cityName);
    if (!citySlug) {
      skippedCbsas.push({ cbsa_code: market.cbsa_code, reason: `Invalid city slug for "${cityName}"` });
      continue;
    }

    // Check for duplicate state+city combination
    const cityKey = `${stateInfo.slug}:${citySlug}`;
    if (seenCities.has(cityKey)) {
      // Skip duplicate - we already have this city from another CBSA
      continue;
    }
    seenCities.add(cityKey);

    cityDefinitions.push({
      state_slug: stateInfo.slug,
      state_abbr: stateInfo.abbr,
      city_slug: citySlug,
      city_name: cityName,
      representative_zip: bestZip.zip_code,
      cbsa_code: market.cbsa_code,
      is_major_city: false, // We can update this later if needed
    });
  }

  console.log(`Resolved ${cityDefinitions.length} city definitions`);
  console.log(`Skipped ${skippedCbsas.length} CBSAs (see details below)`);

  // Step 3: Upsert into city_definitions
  console.log('\n[3/5] Upserting city definitions...');

  let inserted = 0;
  let updated = 0;
  const batchSize = 50;

  for (let i = 0; i < cityDefinitions.length; i += batchSize) {
    const batch = cityDefinitions.slice(i, i + batchSize);

    const { data: upsertResult, error: upsertError } = await supabase
      .from('city_definitions')
      .upsert(batch, {
        onConflict: 'state_slug,city_slug',
        ignoreDuplicates: false,
      })
      .select();

    if (upsertError) {
      console.error(`ERROR upserting batch ${Math.floor(i / batchSize) + 1}:`, upsertError.message);
    } else {
      // Count inserts vs updates (approximate - upsert doesn't distinguish)
      inserted += batch.length;
    }
  }

  console.log(`Upserted ${inserted} city definitions`);

  // Step 4: Verify results
  console.log('\n[4/5] Verifying city_definitions table...');

  const { count: totalCount } = await supabase
    .from('city_definitions')
    .select('*', { count: 'exact', head: true });

  console.log(`Total rows in city_definitions: ${totalCount}`);

  // Step 5: Output summary
  console.log('\n[5/5] Summary');
  console.log('='.repeat(70));

  console.log(`\nFrontier CBSA targets (≥20% coverage): ${targetCbsas.length}`);
  console.log(`City definitions created/updated: ${cityDefinitions.length}`);
  console.log(`CBSAs skipped: ${skippedCbsas.length}`);

  console.log('\n--- Sample 10 Generated URLs ---');
  cityDefinitions.slice(0, 10).forEach(c => {
    console.log(`  /internet/${c.state_slug}/${c.city_slug}`);
  });

  if (skippedCbsas.length > 0) {
    console.log('\n--- Skipped CBSAs ---');
    skippedCbsas.forEach(s => {
      console.log(`  CBSA ${s.cbsa_code}: ${s.reason}`);
    });
  }

  // Show coverage distribution
  console.log('\n--- Frontier Coverage Distribution ---');
  const coverageBuckets = {
    '80-100%': targetCbsas.filter(m => m.coverage_pct >= 80).length,
    '60-79%': targetCbsas.filter(m => m.coverage_pct >= 60 && m.coverage_pct < 80).length,
    '40-59%': targetCbsas.filter(m => m.coverage_pct >= 40 && m.coverage_pct < 60).length,
    '20-39%': targetCbsas.filter(m => m.coverage_pct >= 20 && m.coverage_pct < 40).length,
  };
  Object.entries(coverageBuckets).forEach(([bucket, count]) => {
    console.log(`  ${bucket}: ${count} CBSAs`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('Done!');
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
