/**
 * Backfill script for city_definitions table
 * Seeds from states.ts data
 *
 * Run with: npx tsx scripts/backfill_city_definitions.ts
 */

import { createClient } from '@supabase/supabase-js';
import { states } from '../src/data/states';

// Load from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing environment variables');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Convert city name to slug
function cityToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '')           // Remove periods (St. Louis -> St Louis)
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Spaces to hyphens
    .replace(/-+/g, '-')          // Collapse multiple hyphens
    .trim();
}

// Convert state name to slug
function stateToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z-]/g, '');
}

// Major cities (top 100 US cities by population - approximate)
const MAJOR_CITIES = new Set([
  'new york city', 'los angeles', 'chicago', 'houston', 'phoenix',
  'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
  'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte',
  'san francisco', 'indianapolis', 'seattle', 'denver', 'washington',
  'boston', 'el paso', 'detroit', 'nashville', 'portland',
  'memphis', 'oklahoma city', 'las vegas', 'louisville', 'baltimore',
  'milwaukee', 'albuquerque', 'tucson', 'fresno', 'mesa',
  'sacramento', 'atlanta', 'kansas city', 'colorado springs', 'miami',
  'raleigh', 'omaha', 'long beach', 'virginia beach', 'oakland',
  'minneapolis', 'tulsa', 'tampa', 'arlington', 'new orleans'
]);

interface CityDefinition {
  state_slug: string;
  state_abbr: string;
  city_slug: string;
  city_name: string;
  representative_zip: string;
  is_major_city: boolean;
}

async function main() {
  console.log('='.repeat(60));
  console.log('City Definitions Backfill Script');
  console.log('='.repeat(60));

  // Build city definitions from states.ts
  const cities: CityDefinition[] = [];

  for (const [stateKey, stateInfo] of Object.entries(states)) {
    const stateSlug = stateToSlug(stateInfo.name);

    for (const city of stateInfo.topCities) {
      const citySlug = cityToSlug(city.name);
      const isMajor = MAJOR_CITIES.has(city.name.toLowerCase());

      cities.push({
        state_slug: stateSlug,
        state_abbr: stateInfo.code,
        city_slug: citySlug,
        city_name: city.name,
        representative_zip: city.zip,
        is_major_city: isMajor
      });
    }
  }

  console.log(`\nPrepared ${cities.length} city definitions from states.ts`);
  console.log(`Major cities: ${cities.filter(c => c.is_major_city).length}`);

  // Clear existing data
  console.log('\nClearing existing city_definitions...');
  const { error: deleteError } = await supabase
    .from('city_definitions')
    .delete()
    .neq('id', 0);  // Delete all

  if (deleteError) {
    console.log('Note: Delete may have failed (table might be empty):', deleteError.message);
  }

  // Insert in batches
  console.log('\nInserting city definitions...');
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    const { error } = await supabase
      .from('city_definitions')
      .insert(batch);

    if (error) {
      console.error(`ERROR at batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Inserted ${inserted} city definitions`);

  // Verify
  const { count } = await supabase
    .from('city_definitions')
    .select('*', { count: 'exact', head: true });

  console.log(`\nVerification: ${count} rows in city_definitions`);

  // Show sample
  const { data: sample } = await supabase
    .from('city_definitions')
    .select('state_abbr, city_name, city_slug, representative_zip, is_major_city')
    .eq('is_major_city', true)
    .limit(10);

  console.log('\nSample major cities:');
  sample?.forEach(c => {
    console.log(`  ${c.city_name}, ${c.state_abbr} (${c.city_slug}) - ZIP ${c.representative_zip}`);
  });

  // Test the view
  console.log('\nTesting city_availability_v1 view...');
  const { data: viewTest, error: viewError } = await supabase
    .from('city_availability_v1')
    .select('state_abbr, city_name, fiber_100_20_pct, cable_100_20_pct, cbsa_code')
    .limit(5);

  if (viewError) {
    console.log('View test error:', viewError.message);
  } else {
    console.log('View working! Sample:');
    viewTest?.forEach(c => {
      console.log(`  ${c.city_name}, ${c.state_abbr}: Fiber ${c.fiber_100_20_pct}%, Cable ${c.cable_100_20_pct}%, CBSA ${c.cbsa_code}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
