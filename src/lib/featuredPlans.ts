/**
 * Featured residential internet plans for each provider
 * These are curated recommendations based on FCC Broadband Label data
 */

export interface FeaturedPlan {
  planName: string
  price: number
  priceNote?: string
  downloadSpeed: number
  uploadSpeed: number
  latency?: number
  technology: 'Fiber' | 'Cable' | '5G' | 'Fixed Wireless' | 'DSL' | 'Satellite'
  features: string[]
  bestFor: string
  tier: 'budget' | 'value' | 'premium'
}

export interface ProviderFeaturedPlans {
  providerId: string
  providerName: string
  slug: string
  plans: FeaturedPlan[]
  notes: string[]
}

export const featuredPlans: ProviderFeaturedPlans[] = [
  {
    providerId: 'frontier-fiber',
    providerName: 'Frontier',
    slug: 'frontier-fiber',
    plans: [
      {
        planName: 'Fiber 500 Internet',
        price: 54.99,
        downloadSpeed: 500,
        uploadSpeed: 500,
        latency: 6,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Free equipment'],
        bestFor: 'Best budget fiber - incredible value',
        tier: 'budget'
      },
      {
        planName: 'Fiber 1 Gig Internet',
        price: 74.99,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        latency: 6,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'No contract', '6ms latency'],
        bestFor: 'Sweet spot for most households',
        tier: 'value'
      },
      {
        planName: 'Fiber 5 Gig Internet',
        price: 139.99,
        downloadSpeed: 5000,
        uploadSpeed: 5000,
        latency: 6,
        technology: 'Fiber',
        features: ['5 Gbps symmetric', 'Ultra-low latency', 'Future-proof', 'Professional grade'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Best overall fiber value in most markets',
      'All plans include symmetric upload speeds',
      '6ms latency is excellent for gaming and video calls',
      'Also offers 2 Gig ($109.99) and 7 Gig ($209.99) tiers'
    ]
  },
  {
    providerId: 'att-internet',
    providerName: 'AT&T',
    slug: 'att-internet',
    plans: [
      {
        planName: 'Internet 300',
        price: 65,
        downloadSpeed: 300,
        uploadSpeed: 300,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No annual contract', 'Free installation'],
        bestFor: 'Budget-friendly fiber option',
        tier: 'budget'
      },
      {
        planName: 'Internet 1000',
        price: 90,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        technology: 'Fiber',
        features: ['Gigabit symmetric', 'No data caps', 'HBO Max included (sometimes)', 'Smart Home Manager app'],
        bestFor: 'Best mainstream fiber value',
        tier: 'value'
      },
      {
        planName: 'Internet 5000',
        price: 255,
        downloadSpeed: 5000,
        uploadSpeed: 5000,
        technology: 'Fiber',
        features: ['5 Gbps symmetric', 'Multi-gig WiFi equipment', 'Priority support', 'Future-proof'],
        bestFor: 'Premium fiber for demanding users',
        tier: 'premium'
      }
    ],
    notes: [
      'AT&T Fiber available in select metro areas',
      'Internet Air ($65/mo) available where fiber is not - uses 5G fixed wireless',
      'All fiber plans have symmetric upload speeds',
      'Equipment included at no extra cost'
    ]
  },
  {
    providerId: 'spectrum',
    providerName: 'Spectrum',
    slug: 'spectrum',
    plans: [
      {
        planName: 'Internet',
        price: 90,
        downloadSpeed: 475,
        uploadSpeed: 11,
        latency: 22,
        technology: 'Cable',
        features: ['No data caps', 'No contracts', 'Free modem', 'Free antivirus'],
        bestFor: 'Entry-level for streaming & browsing',
        tier: 'budget'
      },
      {
        planName: 'Internet Gig',
        price: 95,
        priceNote: 'Starting price varies by location ($85-$110)',
        downloadSpeed: 1000,
        uploadSpeed: 40,
        latency: 22,
        technology: 'Cable',
        features: ['Gigabit download', 'No data caps', '$40/mo intro rate available', 'Advanced WiFi router'],
        bestFor: 'Best value - often cheaper than base plan!',
        tier: 'value'
      },
      {
        planName: 'Internet 2 Gig',
        price: 115,
        priceNote: 'Starting price varies by location ($105-$130)',
        downloadSpeed: 2269,
        uploadSpeed: 1049,
        latency: 22,
        technology: 'Cable',
        features: ['2+ Gbps download', '1 Gbps upload', '$60/mo intro rate', 'Best for large households'],
        bestFor: 'Power users needing fast uploads too',
        tier: 'premium'
      }
    ],
    notes: [
      'No contracts required on any plan',
      'Unlimited data included on all plans',
      'Internet Gig often has promotional pricing below base Internet',
      'Internet 2 Gig offers near-symmetric speeds unlike typical cable'
    ]
  },
  {
    providerId: 't-mobile',
    providerName: 'T-Mobile',
    slug: 't-mobile',
    plans: [
      {
        planName: 'Rely Home Internet',
        price: 55,
        downloadSpeed: 150,
        uploadSpeed: 25,
        technology: '5G',
        features: ['No data caps', 'No contracts', 'No equipment fees', 'Easy self-install'],
        bestFor: 'Budget wireless alternative to cable',
        tier: 'budget'
      },
      {
        planName: 'Home Internet',
        price: 65,
        downloadSpeed: 245,
        uploadSpeed: 31,
        technology: '5G',
        features: ['Unlimited 5G data', 'No annual contracts', 'Price lock guarantee', 'Free gateway device'],
        bestFor: 'Standard 5G home internet',
        tier: 'value'
      },
      {
        planName: 'All-In Home Internet',
        price: 75,
        downloadSpeed: 245,
        uploadSpeed: 31,
        technology: '5G',
        features: ['Unlimited data', 'Premium features', 'Priority network access', 'Enhanced support'],
        bestFor: 'Premium 5G with extras',
        tier: 'premium'
      }
    ],
    notes: [
      'Speeds vary significantly by location and 5G coverage',
      'Great alternative where cable/fiber unavailable',
      'Check coverage at t-mobile.com before ordering',
      'Typical speeds: 100-400+ Mbps where 5G Ultra Capacity available'
    ]
  },
  {
    providerId: 'wow',
    providerName: 'WOW!',
    slug: 'wow',
    plans: [
      {
        planName: 'Internet 200',
        price: 40,
        downloadSpeed: 210,
        uploadSpeed: 10,
        latency: 21,
        technology: 'Cable',
        features: ['No data caps', 'No contracts', 'Self-install option', 'Price lock available'],
        bestFor: 'Budget-friendly cable for light users',
        tier: 'budget'
      },
      {
        planName: 'Fiber 1Gbps',
        price: 60,
        priceNote: 'Limited availability',
        downloadSpeed: 1060,
        uploadSpeed: 1005,
        latency: 3,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', '3ms latency', 'Best-in-class fiber'],
        bestFor: 'Best value fiber where available',
        tier: 'value'
      },
      {
        planName: 'Fiber 5Gbps',
        price: 190,
        downloadSpeed: 5271,
        uploadSpeed: 4192,
        latency: 4,
        technology: 'Fiber',
        features: ['5+ Gbps speeds', 'Ultra-low latency', 'Near-symmetric uploads', 'Future-proof'],
        bestFor: 'Power users in WOW! fiber areas',
        tier: 'premium'
      }
    ],
    notes: [
      'Available in Midwest and Southeast markets',
      'Fiber service expanding to more areas',
      'Price lock plans available at slightly higher prices',
      'Known for excellent customer service'
    ]
  },
  {
    providerId: 'google-fiber',
    providerName: 'Google Fiber',
    slug: 'google-fiber',
    plans: [
      {
        planName: '1 Gig',
        price: 70,
        downloadSpeed: 1140,
        uploadSpeed: 1137,
        latency: 13,
        technology: 'Fiber',
        features: ['True symmetric gigabit', 'Unlimited data', 'No contract', 'No equipment fees'],
        bestFor: 'Best overall fiber value',
        tier: 'budget'
      },
      {
        planName: '2 Gig',
        price: 100,
        downloadSpeed: 2250,
        uploadSpeed: 1137,
        latency: 13,
        technology: 'Fiber',
        features: ['2+ Gbps download', 'Gigabit upload', 'No contracts', 'Included mesh WiFi'],
        bestFor: 'Multi-user households',
        tier: 'value'
      },
      {
        planName: '8 Gig',
        price: 150,
        downloadSpeed: 8086,
        uploadSpeed: 8119,
        latency: 13,
        technology: 'Fiber',
        features: ['8+ Gbps symmetric', '13ms latency', 'Future-proof', 'Professional grade'],
        bestFor: 'Fastest residential fiber available',
        tier: 'premium'
      }
    ],
    notes: [
      'Available in select cities (Austin, Nashville, Kansas City, etc.)',
      'No hidden fees or annual contracts',
      'Known for transparent pricing',
      'Expanding to new markets'
    ]
  },
  {
    providerId: 'starlink',
    providerName: 'Starlink',
    slug: 'starlink',
    plans: [
      {
        planName: 'Residential Lite',
        price: 79,
        downloadSpeed: 75,
        uploadSpeed: 10,
        latency: 38,
        technology: 'Satellite',
        features: ['No contracts', 'Global coverage potential', 'Easy self-install', 'Portable option'],
        bestFor: 'Budget satellite for rural areas',
        tier: 'budget'
      },
      {
        planName: 'Residential',
        price: 120,
        downloadSpeed: 100,
        uploadSpeed: 15,
        latency: 38,
        technology: 'Satellite',
        features: ['Unlimited data', 'Priority bandwidth', 'Low latency for satellite', 'Wide coverage'],
        bestFor: 'Best satellite internet available',
        tier: 'value'
      },
      {
        planName: 'Priority',
        price: 250,
        priceNote: 'Business/priority tier',
        downloadSpeed: 220,
        uploadSpeed: 25,
        latency: 38,
        technology: 'Satellite',
        features: ['Priority data', 'Faster speeds', 'Business support', 'SLA available'],
        bestFor: 'Business or demanding users in rural areas',
        tier: 'premium'
      }
    ],
    notes: [
      'Best option for rural/remote areas without other broadband',
      'One-time equipment cost: $349+ (standard kit)',
      'Speeds vary by location and network congestion',
      'Low-earth orbit provides much lower latency than traditional satellite'
    ]
  },
  {
    providerId: 'viasat',
    providerName: 'Viasat',
    slug: 'viasat',
    plans: [
      {
        planName: 'Unleashed',
        price: 99.99,
        downloadSpeed: 40,
        uploadSpeed: 7,
        latency: 620,
        technology: 'Satellite',
        features: ['Unlimited data', 'No hard data caps', 'Wide availability', 'Month-to-month option'],
        bestFor: 'Budget unlimited satellite',
        tier: 'budget'
      },
      {
        planName: 'Business Choice 50',
        price: 99.99,
        downloadSpeed: 50,
        uploadSpeed: 4,
        latency: 651,
        technology: 'Satellite',
        features: ['300 GB priority data', 'Business support', 'Static IP available', 'SLA options'],
        bestFor: 'Small business in rural areas',
        tier: 'value'
      },
      {
        planName: 'Business Choice 100',
        price: 149.99,
        downloadSpeed: 84,
        uploadSpeed: 4,
        latency: 654,
        technology: 'Satellite',
        features: ['300 GB priority data', 'Higher speeds', 'Business features', 'Priority support'],
        bestFor: 'Business needing faster satellite',
        tier: 'premium'
      }
    ],
    notes: [
      'Traditional geostationary satellite with higher latency',
      'Good option where Starlink unavailable or waitlisted',
      'Equipment lease fee: $9.99-$15/month',
      'Not ideal for video calls or gaming due to latency'
    ]
  },
  {
    providerId: 'xfinity',
    providerName: 'Xfinity',
    slug: 'xfinity',
    plans: [
      {
        planName: 'Connect More',
        price: 55,
        downloadSpeed: 400,
        uploadSpeed: 20,
        latency: 19,
        technology: 'Cable',
        features: ['No data caps in most areas', 'xFi Gateway included', 'Peacock Premium included', 'Flex streaming box'],
        bestFor: 'Budget option for light users',
        tier: 'budget'
      },
      {
        planName: 'Gigabit',
        price: 80,
        downloadSpeed: 1000,
        uploadSpeed: 35,
        latency: 14,
        technology: 'Cable',
        features: ['1 Gbps download speeds', 'xFi Gateway included', 'Advanced security', 'Unlimited data (some areas)'],
        bestFor: 'Best value for most households',
        tier: 'value'
      },
      {
        planName: 'Gigabit Extra',
        price: 100,
        downloadSpeed: 1200,
        uploadSpeed: 35,
        latency: 14,
        technology: 'Cable',
        features: ['1.2 Gbps download speeds', 'Premium WiFi equipment', 'Wall-to-wall coverage', 'Priority support'],
        bestFor: 'Large homes needing extra speed',
        tier: 'premium'
      }
    ],
    notes: [
      'Largest cable internet provider in the US',
      'Data caps vary by market (1.2 TB in most areas)',
      'Equipment rental fee: ~$14/month or BYO modem',
      'Bundle discounts available with TV/phone'
    ]
  },
  {
    providerId: 'metronet',
    providerName: 'Metronet',
    slug: 'metronet',
    plans: [
      {
        planName: '100 Mbps',
        price: 49.95,
        downloadSpeed: 100,
        uploadSpeed: 100,
        latency: 13,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contracts', 'Free standard installation'],
        bestFor: 'Budget fiber for light users',
        tier: 'budget'
      },
      {
        planName: '500 Mbps',
        price: 59.95,
        downloadSpeed: 500,
        uploadSpeed: 500,
        latency: 13,
        technology: 'Fiber',
        features: ['Symmetric 500 Mbps', 'No data caps', 'Whole-home WiFi available', 'Low latency'],
        bestFor: 'Best value for streaming and gaming',
        tier: 'value'
      },
      {
        planName: '1 Gig',
        price: 69.95,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        latency: 13,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'Excellent for remote work', 'Multiple 4K streams'],
        bestFor: 'Power users and large households',
        tier: 'premium'
      }
    ],
    notes: [
      'Expanding fiber network in Midwest and Southeast',
      'No contracts required',
      'Whole-home WiFi add-on: $9.95/month',
      'Also offers 2 Gig for $99.95/month in select areas'
    ]
  },
  {
    providerId: 'cox',
    providerName: 'Cox',
    slug: 'cox',
    plans: [
      {
        planName: 'Go Fast',
        price: 50,
        downloadSpeed: 250,
        uploadSpeed: 10,
        latency: 14,
        technology: 'Cable',
        features: ['No contract', '1.25 TB data cap', 'Free installation'],
        bestFor: 'Budget-friendly cable option',
        tier: 'budget'
      },
      {
        planName: 'Go Even Faster',
        price: 70,
        downloadSpeed: 500,
        uploadSpeed: 10,
        latency: 13,
        technology: 'Cable',
        features: ['No contract', '1.25 TB data cap', 'Panoramic WiFi available'],
        bestFor: 'Best value for most homes',
        tier: 'value'
      },
      {
        planName: 'Go Beyond Fast',
        price: 100,
        downloadSpeed: 1000,
        uploadSpeed: 35,
        latency: 13,
        technology: 'Cable',
        features: ['No contract', 'Unlimited data option', 'Gigabit speeds'],
        bestFor: 'Power users & large households',
        tier: 'premium'
      }
    ],
    notes: [
      'Major cable provider in 19 states',
      '1.25 TB data cap applies, unlimited add-on available',
      'Panoramic WiFi equipment rental: ~$14/month',
      'Bundle discounts with TV and phone'
    ]
  },
  {
    providerId: 'breezeline',
    providerName: 'Breezeline',
    slug: 'breezeline',
    plans: [
      {
        planName: 'Internet 200',
        price: 55,
        downloadSpeed: 200,
        uploadSpeed: 10,
        latency: 16,
        technology: 'Cable',
        features: ['No data caps', 'No contract', 'Free modem'],
        bestFor: 'Budget cable option',
        tier: 'budget'
      },
      {
        planName: 'Internet 500',
        price: 75,
        downloadSpeed: 500,
        uploadSpeed: 20,
        latency: 15,
        technology: 'Cable',
        features: ['No data caps', 'No contract', 'WiFi included'],
        bestFor: 'Best value for streaming',
        tier: 'value'
      },
      {
        planName: 'Fiber 2 Gig',
        price: 80,
        downloadSpeed: 2000,
        uploadSpeed: 2000,
        latency: 2,
        technology: 'Fiber',
        features: ['No data caps', 'Symmetric speeds', 'Ultra-low latency', 'Fiber optic'],
        bestFor: 'Power users needing top speeds',
        tier: 'premium'
      }
    ],
    notes: [
      'Formerly Atlantic Broadband and WOW Cable',
      'No data caps on any residential plan',
      'Fiber available in select markets',
      'Whole-home WiFi system available'
    ]
  },
  {
    providerId: 'astound-broadband',
    providerName: 'Astound Broadband',
    slug: 'astound-broadband',
    plans: [
      {
        planName: 'Internet 300',
        price: 30,
        downloadSpeed: 300,
        uploadSpeed: 20,
        latency: 18,
        technology: 'Cable',
        features: ['No data caps', 'No contract', 'Price lock guarantee'],
        bestFor: 'Great entry-level value',
        tier: 'budget'
      },
      {
        planName: 'Internet 600',
        price: 50,
        downloadSpeed: 600,
        uploadSpeed: 35,
        latency: 11,
        technology: 'Cable',
        features: ['No data caps', 'No contract', 'Whole-home WiFi available'],
        bestFor: 'Best value for families',
        tier: 'value'
      },
      {
        planName: 'Internet 1 Gig',
        price: 65,
        downloadSpeed: 1000,
        uploadSpeed: 50,
        latency: 12,
        technology: 'Cable',
        features: ['No data caps', 'Gigabit speeds', 'eero WiFi included'],
        bestFor: 'Large households & power users',
        tier: 'premium'
      }
    ],
    notes: [
      'Operates as RCN, Grande, and Wave brands',
      'No data caps in any market',
      'Price lock guarantee for 2 years',
      'eero whole-home WiFi included with higher tiers'
    ]
  },
  {
    providerId: 'consolidated-communications',
    providerName: 'Consolidated / Fidium',
    slug: 'consolidated-communications',
    plans: [
      {
        planName: 'Fidium 250',
        price: 45,
        downloadSpeed: 250,
        uploadSpeed: 250,
        latency: 8,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Fiber optic'],
        bestFor: 'Entry-level fiber option',
        tier: 'budget'
      },
      {
        planName: 'Fidium 500',
        price: 55,
        downloadSpeed: 500,
        uploadSpeed: 500,
        latency: 8,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'Whole-home WiFi', 'Fiber optic'],
        bestFor: 'Best value symmetric fiber',
        tier: 'value'
      },
      {
        planName: 'Fidium 1 Gig',
        price: 70,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        latency: 8,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'Premium WiFi included', 'Low latency'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Fidium Fiber brand expanding rapidly',
      'Symmetric upload speeds on all plans',
      'No contracts or data caps',
      'Also offers legacy DSL in some areas'
    ]
  },
  {
    providerId: 'buckeye-cable',
    providerName: 'Buckeye Broadband',
    slug: 'buckeye-cable',
    plans: [
      {
        planName: 'Starter 100',
        price: 50,
        downloadSpeed: 100,
        uploadSpeed: 10,
        latency: 20,
        technology: 'Cable',
        features: ['No contract', 'Free installation', 'Local customer service'],
        bestFor: 'Light internet users',
        tier: 'budget'
      },
      {
        planName: 'Fiber 600',
        price: 70,
        downloadSpeed: 600,
        uploadSpeed: 600,
        latency: 15,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'Fiber optic', 'No contract'],
        bestFor: 'Best value fiber option',
        tier: 'value'
      },
      {
        planName: 'Fiber 6 Gig',
        price: 200,
        downloadSpeed: 6000,
        uploadSpeed: 6000,
        latency: 15,
        technology: 'Fiber',
        features: ['6 Gbps symmetric', 'No data caps', 'Multi-gig speeds', 'Future-proof'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Regional provider in Northwest Ohio',
      'Fiber network expanding',
      'Local customer service and support',
      'Cable plans have data caps, fiber does not'
    ]
  },
  {
    providerId: 'brightspeed',
    providerName: 'Brightspeed',
    slug: 'brightspeed',
    plans: [
      {
        planName: 'Fiber 200',
        price: 49,
        downloadSpeed: 200,
        uploadSpeed: 200,
        latency: 5,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Fiber optic'],
        bestFor: 'Entry-level fiber',
        tier: 'budget'
      },
      {
        planName: 'Fiber 500',
        price: 59,
        downloadSpeed: 500,
        uploadSpeed: 500,
        latency: 5,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'Low latency', 'Fiber optic'],
        bestFor: 'Best value for most homes',
        tier: 'value'
      },
      {
        planName: 'Fiber 1 Gig',
        price: 65,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        latency: 3,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'Ultra-low latency', 'Fiber optic'],
        bestFor: 'Power users & gamers',
        tier: 'premium'
      }
    ],
    notes: [
      'Spun off from Lumen/CenturyLink in 2022',
      'Rapidly building new fiber network',
      'No data caps or contracts',
      'Legacy DSL service in some areas'
    ]
  },
  {
    providerId: 'centurylink',
    providerName: 'CenturyLink',
    slug: 'centurylink',
    plans: [
      {
        planName: 'Simply Unlimited 100',
        price: 50,
        downloadSpeed: 100,
        uploadSpeed: 10,
        latency: 18,
        technology: 'DSL',
        features: ['No data caps', 'No contract', 'Price for life guarantee'],
        bestFor: 'Basic internet needs',
        tier: 'budget'
      },
      {
        planName: 'Fiber 200',
        price: 50,
        downloadSpeed: 200,
        uploadSpeed: 200,
        latency: 12,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Fiber optic'],
        bestFor: 'Entry-level fiber value',
        tier: 'value'
      },
      {
        planName: 'Fiber Gigabit',
        price: 70,
        downloadSpeed: 940,
        uploadSpeed: 940,
        latency: 10,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'No contract', 'Price for life'],
        bestFor: 'Power users & large households',
        tier: 'premium'
      }
    ],
    notes: [
      'Now part of Lumen Technologies',
      'Price for Life guarantee on fiber plans',
      'DSL available where fiber is not',
      'No data caps or long-term contracts'
    ]
  },
  {
    providerId: 'altafiber',
    providerName: 'altafiber',
    slug: 'altafiber',
    plans: [
      {
        planName: 'Fioptics 250',
        price: 45,
        downloadSpeed: 250,
        uploadSpeed: 250,
        latency: 8,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Fiber optic'],
        bestFor: 'Entry-level fiber',
        tier: 'budget'
      },
      {
        planName: 'Fioptics 500',
        price: 55,
        downloadSpeed: 500,
        uploadSpeed: 500,
        latency: 8,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'WiFi included', 'Fiber optic'],
        bestFor: 'Best value for families',
        tier: 'value'
      },
      {
        planName: 'Fioptics 2 Gig',
        price: 85,
        downloadSpeed: 2000,
        uploadSpeed: 2000,
        latency: 6,
        technology: 'Fiber',
        features: ['2 Gbps symmetric', 'No data caps', 'Premium WiFi', 'Low latency'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Formerly Cincinnati Bell Fioptics',
      'Fiber network across Ohio, Kentucky, Indiana',
      'No data caps or contracts',
      'Whole-home WiFi included on higher tiers'
    ]
  },
  {
    providerId: 'verizon-fios',
    providerName: 'Verizon Fios',
    slug: 'verizon-fios',
    plans: [
      {
        planName: 'Fios 300 Mbps',
        price: 59.99,
        downloadSpeed: 307,
        uploadSpeed: 324,
        latency: 7,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Low latency'],
        bestFor: 'Budget-friendly fiber option',
        tier: 'budget'
      },
      {
        planName: 'Fios 500 Mbps',
        price: 84.99,
        downloadSpeed: 517,
        uploadSpeed: 552,
        latency: 10,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Great for gaming'],
        bestFor: 'Best value for most homes',
        tier: 'value'
      },
      {
        planName: 'Fios 2 Gig',
        price: 119.99,
        downloadSpeed: 2315,
        uploadSpeed: 2017,
        latency: 6,
        technology: 'Fiber',
        features: ['Multi-gig speeds', 'No data caps', 'Ultra-low latency', 'Future-proof'],
        bestFor: 'Power users & large households',
        tier: 'premium'
      }
    ],
    notes: [
      'Available in East Coast metro areas',
      'All plans have symmetric upload speeds',
      'No data caps or annual contracts',
      'Also offers 1 Gig for $99.99/mo'
    ]
  },
  {
    providerId: 'optimum',
    providerName: 'Optimum',
    slug: 'optimum',
    plans: [
      {
        planName: '300 Mbps Fiber',
        price: 45,
        downloadSpeed: 365,
        uploadSpeed: 323,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Fiber optic'],
        bestFor: 'Entry-level fiber option',
        tier: 'budget'
      },
      {
        planName: '1 Gig Fiber',
        price: 65,
        downloadSpeed: 1217,
        uploadSpeed: 1078,
        technology: 'Fiber',
        features: ['Gigabit speeds', 'No data caps', 'Near-symmetric upload', 'Low latency'],
        bestFor: 'Best value for most homes',
        tier: 'value'
      },
      {
        planName: '2 Gig Fiber',
        price: 125,
        downloadSpeed: 2262,
        uploadSpeed: 2268,
        technology: 'Fiber',
        features: ['Multi-gig symmetric', 'No data caps', 'Ultra-fast uploads', 'Future-proof'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Available in NY, NJ, CT metro areas',
      'Fiber and cable options available',
      'No data caps on fiber plans',
      'Also offers 5 Gig ($185) and 8 Gig ($285) tiers'
    ]
  },
  {
    providerId: 'windstream',
    providerName: 'Windstream',
    slug: 'windstream',
    plans: [
      {
        planName: 'Kinetic 300 Mbps',
        price: 44.99,
        downloadSpeed: 300,
        uploadSpeed: 300,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Fiber optic'],
        bestFor: 'Budget-friendly fiber',
        tier: 'budget'
      },
      {
        planName: 'Kinetic 1 Gig',
        price: 44.99,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'No contract', 'Same price as 300!'],
        bestFor: 'Best value - gigabit at budget price',
        tier: 'value'
      },
      {
        planName: 'Kinetic 2 Gig',
        price: 104.99,
        downloadSpeed: 2000,
        uploadSpeed: 2000,
        technology: 'Fiber',
        features: ['2 Gbps symmetric', 'No data caps', 'Ultra-fast', 'Future-proof'],
        bestFor: 'Power users & large households',
        tier: 'premium'
      }
    ],
    notes: [
      'Kinetic fiber expanding in 18 states',
      'All fiber plans have symmetric speeds',
      'DSL available where fiber is not',
      'No data caps or contracts on any plan'
    ]
  },
  {
    providerId: 'ziply-fiber',
    providerName: 'Ziply Fiber',
    slug: 'ziply-fiber',
    plans: [
      {
        planName: 'Fiber 100',
        price: 20,
        downloadSpeed: 103,
        uploadSpeed: 103,
        latency: 4,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Ultra-low latency'],
        bestFor: 'Budget fiber with amazing latency',
        tier: 'budget'
      },
      {
        planName: 'Fiber Gig',
        price: 60,
        downloadSpeed: 1145,
        uploadSpeed: 1143,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'No contract', 'Low latency'],
        bestFor: 'Best value gigabit fiber',
        tier: 'value'
      },
      {
        planName: 'Fiber 5 Gig',
        price: 80,
        downloadSpeed: 5568,
        uploadSpeed: 5667,
        technology: 'Fiber',
        features: ['5+ Gbps symmetric', 'No data caps', 'Ultra-fast', 'Future-proof'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Serves Pacific Northwest (WA, OR, ID, MT)',
      'Fiber 100 at $20/mo is one of the cheapest fiber options',
      'Symmetric speeds on all fiber plans',
      'Also offers 2 Gig ($70) and 10 Gig ($300) tiers'
    ]
  },
  {
    providerId: 'tds-telecom',
    providerName: 'TDS Telecom',
    slug: 'tds-telecom',
    plans: [
      {
        planName: 'Extreme 300',
        price: 49.95,
        downloadSpeed: 331,
        uploadSpeed: 332,
        latency: 9,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Low latency'],
        bestFor: 'Entry-level fiber',
        tier: 'budget'
      },
      {
        planName: 'Extreme 600',
        price: 69.95,
        downloadSpeed: 638,
        uploadSpeed: 631,
        latency: 9,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'Great for streaming', 'Low latency'],
        bestFor: 'Best value for families',
        tier: 'value'
      },
      {
        planName: 'Extreme 1 Gig',
        price: 89.95,
        downloadSpeed: 948,
        uploadSpeed: 937,
        latency: 9,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'Low latency', 'Professional grade'],
        bestFor: 'Power users & large households',
        tier: 'premium'
      }
    ],
    notes: [
      'Fiber network in 30+ states',
      'All fiber plans have symmetric speeds',
      'No data caps or contracts',
      'DSL available in some rural areas'
    ]
  }
]

// Helper function to get plans for a specific provider
export function getFeaturedPlansForProvider(slug: string): ProviderFeaturedPlans | undefined {
  return featuredPlans.find(p => p.slug === slug || p.providerId === slug)
}

// Helper to get all featured plans as a flat array with provider info
export function getAllFeaturedPlans(): Array<FeaturedPlan & { providerName: string; providerSlug: string }> {
  return featuredPlans.flatMap(provider =>
    provider.plans.map(plan => ({
      ...plan,
      providerName: provider.providerName,
      providerSlug: provider.slug
    }))
  )
}

// Helper to get best value plan across all providers
export function getBestValuePlans(): Array<FeaturedPlan & { providerName: string; providerSlug: string }> {
  return getAllFeaturedPlans()
    .filter(plan => plan.tier === 'value')
    .sort((a, b) => {
      // Sort by value score (speed per dollar)
      const scoreA = a.downloadSpeed / a.price
      const scoreB = b.downloadSpeed / b.price
      return scoreB - scoreA
    })
}

// Format plan for display
export function formatPlanSummary(plan: FeaturedPlan, providerName: string): string {
  const speedStr = plan.uploadSpeed === plan.downloadSpeed
    ? `${plan.downloadSpeed} Mbps symmetric`
    : `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`

  return `${providerName} ${plan.planName}: $${plan.price}/mo - ${speedStr} (${plan.technology})`
}

// Get comparison text for chat
export function getPlansComparisonText(): string {
  const lines = [
    '## Featured Internet Plans by Provider\n',
  ]

  for (const provider of featuredPlans) {
    lines.push(`### ${provider.providerName}`)
    for (const plan of provider.plans) {
      const speedStr = plan.uploadSpeed === plan.downloadSpeed
        ? `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`
        : `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`
      const tierLabel = plan.tier === 'budget' ? 'Budget' : plan.tier === 'value' ? 'Best Value' : 'Premium'
      lines.push(`- **${plan.planName}** ($${plan.price}/mo): ${speedStr} ${plan.technology} - ${tierLabel}`)
    }
    lines.push('')
  }

  lines.push('### Best Value Rankings')
  const valueRanked = getBestValuePlans()
  valueRanked.slice(0, 4).forEach((plan, i) => {
    lines.push(`${i + 1}. ${plan.providerName} ${plan.planName} - $${plan.price}/mo for ${plan.downloadSpeed} Mbps`)
  })

  return lines.join('\n')
}
