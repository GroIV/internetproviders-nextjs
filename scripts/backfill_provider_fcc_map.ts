/**
 * Backfill script for provider_fcc_map table
 *
 * This script:
 * 1. Queries fcc_providers by known name patterns
 * 2. Matches them to our providers by slug
 * 3. UPSERTs mappings into provider_fcc_map
 * 4. Logs unmatched FCC providers for manual review
 *
 * Run with: npx tsx docs/migrations/backfill_provider_fcc_map.ts
 *
 * Prerequisites:
 * - Run 01_provider_fcc_map.sql first
 * - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 */

import { createClient } from '@supabase/supabase-js';

// Load from environment - NEVER hardcode secrets
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing environment variables');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Known FCC name patterns -> our provider slug
// Pattern can be a string (ILIKE match) or regex-style for more complex matching
interface ProviderMapping {
  slug: string;
  patterns: string[];  // FCC name patterns (case-insensitive ILIKE)
  confidence: number;
  notes?: string;
}

const KNOWN_MAPPINGS: ProviderMapping[] = [
  // Major Cable
  {
    slug: 'xfinity',
    patterns: ['comcast%', '%xfinity%'],
    confidence: 1.00,
    notes: 'Comcast Corporation / Xfinity'
  },
  {
    slug: 'spectrum',
    patterns: ['charter%', '%spectrum%'],
    confidence: 1.00,
    notes: 'Charter Communications / Spectrum'
  },
  {
    slug: 'cox',
    patterns: ['cox%'],
    confidence: 1.00,
    notes: 'Cox Communications'
  },
  {
    slug: 'optimum',
    patterns: ['altice%', '%optimum%', '%cablevision%'],
    confidence: 1.00,
    notes: 'Altice USA / Optimum / Cablevision'
  },

  // Major Telco / Fiber
  {
    slug: 'att-internet',
    patterns: ['at&t%', 'att %', 'at&t services%'],
    confidence: 1.00,
    notes: 'AT&T Inc.'
  },
  {
    slug: 'verizon-fios',
    patterns: ['verizon%'],
    confidence: 0.90,
    notes: 'Verizon - may include non-Fios services'
  },
  {
    slug: 'frontier-fiber',
    patterns: ['frontier%'],
    confidence: 1.00,
    notes: 'Frontier Communications'
  },
  {
    slug: 'centurylink',
    patterns: ['centurylink%', 'lumen%', '%qwest%'],
    confidence: 1.00,
    notes: 'Lumen Technologies (CenturyLink)'
  },

  // Regional Fiber
  {
    slug: 'google-fiber',
    patterns: ['google fiber%'],
    confidence: 1.00,
    notes: 'Google Fiber'
  },
  {
    slug: 'ziply-fiber',
    patterns: ['ziply%'],
    confidence: 1.00,
    notes: 'Ziply Fiber'
  },
  {
    slug: 'brightspeed',
    patterns: ['brightspeed%'],
    confidence: 1.00,
    notes: 'Brightspeed'
  },
  {
    slug: 'metronet',
    patterns: ['metronet%'],
    confidence: 1.00,
    notes: 'Metronet'
  },
  {
    slug: 'windstream',
    patterns: ['windstream%'],
    confidence: 1.00,
    notes: 'Windstream / Kinetic'
  },

  // Regional Cable
  {
    slug: 'wow',
    patterns: ['wide open west%', 'wideopenwest%', 'wow %'],
    confidence: 1.00,
    notes: 'WOW! Internet'
  },
  {
    slug: 'astound-broadband',
    patterns: ['rcn%', 'grande%', 'wave broadband%', 'astound%'],
    confidence: 1.00,
    notes: 'Astound Broadband (RCN/Grande/Wave)'
  },
  {
    slug: 'breezeline',
    patterns: ['breezeline%', 'atlantic broadband%'],
    confidence: 1.00,
    notes: 'Breezeline (formerly Atlantic Broadband)'
  },

  // Wireless / 5G
  {
    slug: 't-mobile',
    patterns: ['t-mobile%'],
    confidence: 1.00,
    notes: 'T-Mobile Home Internet'
  },

  // Satellite
  {
    slug: 'viasat',
    patterns: ['viasat%', 'exede%'],
    confidence: 1.00,
    notes: 'Viasat'
  },
  {
    slug: 'hughesnet',
    patterns: ['hughes%', 'hughesnet%'],
    confidence: 1.00,
    notes: 'HughesNet'
  },

  // Other regionals
  {
    slug: 'altafiber',
    patterns: ['altafiber%', 'cincinnati bell%'],
    confidence: 1.00,
    notes: 'altafiber (Cincinnati Bell)'
  },
  {
    slug: 'earthlink',
    patterns: ['earthlink%'],
    confidence: 1.00,
    notes: 'EarthLink'
  },
  {
    slug: 'rise-broadband',
    patterns: ['rise broadband%', 'skybeam%', 'digis%'],
    confidence: 1.00,
    notes: 'Rise Broadband'
  },
  {
    slug: 'consolidated-communications',
    patterns: ['consolidated%', 'fidium%'],
    confidence: 1.00,
    notes: 'Consolidated Communications / Fidium'
  },
  {
    slug: 'tds-telecom',
    patterns: ['tds %', 'tds telecom%'],
    confidence: 1.00,
    notes: 'TDS Telecom'
  },
  {
    slug: 'buckeye-cable',
    patterns: ['buckeye%'],
    confidence: 1.00,
    notes: 'Buckeye Broadband'
  },
];

interface FccProvider {
  provider_id: string;
  name: string;
}

interface OurProvider {
  id: number;
  slug: string;
  name: string;
}

interface MappingResult {
  fcc_provider_id: string;
  fcc_name: string;
  our_provider_id: number;
  our_slug: string;
  confidence: number;
  notes: string | null;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Provider FCC Map Backfill Script');
  console.log('='.repeat(60));

  // Step 1: Get all our providers
  console.log('\n1. Fetching our providers...');
  const { data: ourProviders, error: ourError } = await supabase
    .from('providers')
    .select('id, slug, name');

  if (ourError || !ourProviders) {
    console.error('ERROR fetching providers:', ourError?.message);
    process.exit(1);
  }
  console.log(`   Found ${ourProviders.length} providers in our database`);

  // Create slug -> provider lookup
  const providerBySlug = new Map<string, OurProvider>();
  ourProviders.forEach(p => providerBySlug.set(p.slug, p));

  // Step 2: Get all FCC providers
  console.log('\n2. Fetching FCC providers...');
  const { data: fccProviders, error: fccError } = await supabase
    .from('fcc_providers')
    .select('provider_id, name');

  if (fccError || !fccProviders) {
    console.error('ERROR fetching FCC providers:', fccError?.message);
    process.exit(1);
  }
  console.log(`   Found ${fccProviders.length} FCC providers`);

  // Step 3: Match FCC providers to our providers
  console.log('\n3. Matching providers...');
  const mappings: MappingResult[] = [];
  const unmapped: FccProvider[] = [];
  const matchedFccIds = new Set<string>();

  for (const mapping of KNOWN_MAPPINGS) {
    const ourProvider = providerBySlug.get(mapping.slug);
    if (!ourProvider) {
      console.log(`   WARNING: Our provider not found: ${mapping.slug}`);
      continue;
    }

    // Find all FCC providers matching any of the patterns
    for (const pattern of mapping.patterns) {
      const matchingFcc = fccProviders.filter(fcc =>
        fcc.name.toLowerCase().includes(pattern.replace(/%/g, '').toLowerCase()) ||
        matchesPattern(fcc.name, pattern)
      );

      for (const fcc of matchingFcc) {
        if (!matchedFccIds.has(fcc.provider_id)) {
          matchedFccIds.add(fcc.provider_id);
          mappings.push({
            fcc_provider_id: fcc.provider_id,
            fcc_name: fcc.name,
            our_provider_id: ourProvider.id,
            our_slug: ourProvider.slug,
            confidence: mapping.confidence,
            notes: mapping.notes || null
          });
        }
      }
    }
  }

  // Find unmatched FCC providers (for manual review)
  for (const fcc of fccProviders) {
    if (!matchedFccIds.has(fcc.provider_id)) {
      unmapped.push(fcc);
    }
  }

  console.log(`   Matched: ${mappings.length} FCC providers`);
  console.log(`   Unmatched: ${unmapped.length} FCC providers`);

  // Step 4: UPSERT mappings
  console.log('\n4. Upserting mappings to provider_fcc_map...');

  const upsertData = mappings.map(m => ({
    fcc_provider_id: m.fcc_provider_id,
    provider_id: m.our_provider_id,
    confidence: m.confidence,
    notes: m.notes
  }));

  // Batch upsert
  const batchSize = 100;
  let upserted = 0;

  for (let i = 0; i < upsertData.length; i += batchSize) {
    const batch = upsertData.slice(i, i + batchSize);
    const { error } = await supabase
      .from('provider_fcc_map')
      .upsert(batch, { onConflict: 'fcc_provider_id' });

    if (error) {
      console.error(`   ERROR at batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      upserted += batch.length;
    }
  }

  console.log(`   Upserted ${upserted} mappings`);

  // Step 5: Report unmatched providers (for manual review)
  console.log('\n5. Unmatched FCC providers (for manual review):');
  console.log('   ' + '-'.repeat(56));

  // Group by first letter for readability
  const sortedUnmapped = unmapped.sort((a, b) => a.name.localeCompare(b.name));

  // Only show first 50 and providers with significant coverage
  const topUnmapped = sortedUnmapped.slice(0, 50);
  topUnmapped.forEach(fcc => {
    console.log(`   ${fcc.provider_id}: ${fcc.name}`);
  });

  if (unmapped.length > 50) {
    console.log(`   ... and ${unmapped.length - 50} more`);
  }

  // Step 6: Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total FCC providers:     ${fccProviders.length}`);
  console.log(`Matched to our slugs:    ${mappings.length}`);
  console.log(`Unmatched (needs review): ${unmapped.length}`);
  console.log(`Coverage:                ${((mappings.length / fccProviders.length) * 100).toFixed(1)}%`);

  // Show mapping breakdown
  console.log('\nMappings by our provider:');
  const bySlug = new Map<string, number>();
  mappings.forEach(m => {
    bySlug.set(m.our_slug, (bySlug.get(m.our_slug) || 0) + 1);
  });
  [...bySlug.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([slug, count]) => {
      console.log(`   ${slug}: ${count} FCC entities`);
    });

  console.log('\nDone!');
}

// Simple pattern matching (% is wildcard)
function matchesPattern(str: string, pattern: string): boolean {
  const lowerStr = str.toLowerCase();
  const lowerPattern = pattern.toLowerCase();

  if (lowerPattern.startsWith('%') && lowerPattern.endsWith('%')) {
    return lowerStr.includes(lowerPattern.slice(1, -1));
  }
  if (lowerPattern.startsWith('%')) {
    return lowerStr.endsWith(lowerPattern.slice(1));
  }
  if (lowerPattern.endsWith('%')) {
    return lowerStr.startsWith(lowerPattern.slice(0, -1));
  }
  return lowerStr === lowerPattern;
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
