// Database types for InternetProviders.ai

export interface Guide {
  id: number
  guide_id: string
  title: string
  description: string
  category: string
  zip_code: string
  city: string | null
  state: string | null
  url: string
  slug: string
  publish_date: string | null
  status: string
  content: string | null
  meta_keywords: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface Provider {
  id: number
  name: string
  logo: string | null
  website: string | null
  slug: string | null
  category: string | null
  technologies: string[] | null
  support_phone: string | null
  support_email: string | null
}

export interface Coverage {
  id: number
  provider_id: number
  zip_code: string
  has_service: boolean
  technology: string | null
  availability_percent: number | null
  max_speed: number | null
}

// FCC Broadband Coverage Data (from BDC)
export interface ZipBroadbandCoverage {
  id: number
  zip_code: string
  city: string | null
  total_housing_units: number
  // Any Technology coverage percentages
  any_25_3: number | null
  any_100_20: number | null
  any_1000_100: number | null
  // Fiber coverage percentages
  fiber_25_3: number | null
  fiber_100_20: number | null
  fiber_1000_100: number | null
  // Cable coverage percentages
  cable_25_3: number | null
  cable_100_20: number | null
  cable_1000_100: number | null
  // Fixed Wireless coverage percentages
  fixed_wireless_25_3: number | null
  fixed_wireless_100_20: number | null
  // Metadata
  data_source: string
  created_at: string
  updated_at: string
}

// API Response for broadband coverage by ZIP
export interface BroadbandCoverageResponse {
  success: boolean
  data: {
    zipCode: string
    city: string | null
    totalHousingUnits: number
    coverage: {
      anyTechnology: {
        speed25_3: number | null
        speed100_20: number | null
        speed1000_100: number | null
      }
      fiber: {
        speed25_3: number | null
        speed100_20: number | null
        speed1000_100: number | null
      }
      cable: {
        speed25_3: number | null
        speed100_20: number | null
        speed1000_100: number | null
      }
      fixedWireless: {
        speed25_3: number | null
        speed100_20: number | null
      }
    }
    dataSource: string
  }
}

export interface Plan {
  id: number
  provider_id: number
  name: string
  download_speed: number
  upload_speed: number
  price: number
  promo: string | null
  contract_length: number | null
  data_cap: number | null
}

// FCC Broadband Consumer Labels data
export interface BroadbandPlan {
  id: number
  fcc_plan_id: string
  provider_name: string
  provider_id: number | null
  service_plan_name: string
  tier_plan_name: string | null
  connection_type: 'Fixed' | 'Mobile' | 'Satellite'
  service_type: 'residential' | 'business' | 'mobile'
  monthly_price: number
  has_intro_rate: boolean
  intro_rate_price: number | null
  intro_rate_months: number | null
  contract_required: boolean
  contract_months: number | null
  contract_terms_url: string | null
  early_termination_fee: number
  one_time_fees: Array<{ name: string; amount: number }>
  monthly_fees: Array<{ name: string; amount: number }>
  tax_info: string | null
  typical_download_speed: number | null
  typical_upload_speed: number | null
  typical_latency: number | null
  monthly_data_gb: number | null // null = unlimited
  overage_price_per_gb: number | null
  overage_increment_gb: number | null
  bundle_discounts_url: string | null
  data_allowance_policy_url: string | null
  network_management_url: string | null
  privacy_policy_url: string | null
  support_phone: string | null
  support_url: string | null
  data_source: string
  source_file: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// API Response for broadband plans
export interface BroadbandPlansResponse {
  success: boolean
  plans: BroadbandPlan[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Response types
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface GuidesStatsResponse {
  success: boolean
  data: {
    total: number
    byCategory: Record<string, number>
    byState: Record<string, number>
    uniqueZipCodes: number
    uniqueCities: number
  }
}
