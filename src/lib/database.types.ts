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
