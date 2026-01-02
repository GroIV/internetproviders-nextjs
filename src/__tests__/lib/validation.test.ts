import {
  ChatRequestSchema,
  ZipCodeSchema,
  CreateScheduledUpdateSchema,
  PatchUpdateSchema,
  AvailabilityQuerySchema,
  PlansQuerySchema,
  validateRequest,
  getValidationError,
} from '@/lib/validation/schemas'

describe('ZipCodeSchema', () => {
  it('should accept valid 5-digit ZIP codes', () => {
    expect(ZipCodeSchema.safeParse('12345').success).toBe(true)
    expect(ZipCodeSchema.safeParse('00000').success).toBe(true)
    expect(ZipCodeSchema.safeParse('99999').success).toBe(true)
  })

  it('should reject invalid ZIP codes', () => {
    expect(ZipCodeSchema.safeParse('1234').success).toBe(false) // too short
    expect(ZipCodeSchema.safeParse('123456').success).toBe(false) // too long
    expect(ZipCodeSchema.safeParse('abcde').success).toBe(false) // letters
    expect(ZipCodeSchema.safeParse('').success).toBe(false) // empty
  })
})

describe('ChatRequestSchema', () => {
  it('should accept valid chat request', () => {
    const validRequest = {
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      zipCode: '78701',
    }
    expect(ChatRequestSchema.safeParse(validRequest).success).toBe(true)
  })

  it('should require at least one message', () => {
    const result = ChatRequestSchema.safeParse({ messages: [] })
    expect(result.success).toBe(false)
  })

  it('should reject invalid message roles', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'invalid', content: 'test' }],
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty message content', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: '' }],
    })
    expect(result.success).toBe(false)
  })

  it('should accept optional zipCode and pageContext', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'Hello' }],
    })
    expect(result.success).toBe(true)

    const resultWithContext = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'Hello' }],
      pageContext: 'Viewing Spectrum provider page',
    })
    expect(resultWithContext.success).toBe(true)
  })
})

describe('CreateScheduledUpdateSchema', () => {
  const validUpdate = {
    provider_slug: 'spectrum',
    provider_name: 'Spectrum',
    effective_date: '2024-03-01',
    category: 'pricing',
    change_type: 'price_increase',
    title: 'Price increase for basic plans',
  }

  it('should accept valid scheduled update', () => {
    expect(CreateScheduledUpdateSchema.safeParse(validUpdate).success).toBe(true)
  })

  it('should require all mandatory fields', () => {
    const incomplete = { title: 'Test' }
    expect(CreateScheduledUpdateSchema.safeParse(incomplete).success).toBe(false)
  })

  it('should validate date format', () => {
    const invalidDate = { ...validUpdate, effective_date: '2024/03/01' }
    expect(CreateScheduledUpdateSchema.safeParse(invalidDate).success).toBe(false)

    const validDate = { ...validUpdate, effective_date: '2024-03-01' }
    expect(CreateScheduledUpdateSchema.safeParse(validDate).success).toBe(true)
  })

  it('should validate category enum', () => {
    const invalidCategory = { ...validUpdate, category: 'invalid' }
    expect(CreateScheduledUpdateSchema.safeParse(invalidCategory).success).toBe(false)
  })

  it('should validate change_type enum', () => {
    const invalidType = { ...validUpdate, change_type: 'invalid' }
    expect(CreateScheduledUpdateSchema.safeParse(invalidType).success).toBe(false)
  })

  it('should accept optional fields', () => {
    const withOptional = {
      ...validUpdate,
      description: 'Some description',
      sql_to_execute: 'UPDATE plans SET price = 50',
    }
    expect(CreateScheduledUpdateSchema.safeParse(withOptional).success).toBe(true)
  })
})

describe('AvailabilityQuerySchema', () => {
  it('should accept lat/lng coordinates', () => {
    const result = AvailabilityQuerySchema.safeParse({ lat: 30.2672, lng: -97.7431 })
    expect(result.success).toBe(true)
  })

  it('should accept address', () => {
    const result = AvailabilityQuerySchema.safeParse({ address: '123 Main St, Austin, TX' })
    expect(result.success).toBe(true)
  })

  it('should reject when neither lat/lng nor address provided', () => {
    const result = AvailabilityQuerySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should validate lat/lng ranges', () => {
    expect(AvailabilityQuerySchema.safeParse({ lat: 91, lng: 0 }).success).toBe(false)
    expect(AvailabilityQuerySchema.safeParse({ lat: 0, lng: 181 }).success).toBe(false)
  })
})

describe('PlansQuerySchema', () => {
  it('should accept valid query with defaults', () => {
    const result = PlansQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(10)
    }
  })

  it('should accept all filter options', () => {
    const result = PlansQuerySchema.safeParse({
      zip: '78701',
      provider: 'spectrum',
      technology: 'Fiber',
      tier: 'premium',
      limit: 20,
    })
    expect(result.success).toBe(true)
  })

  it('should validate technology enum', () => {
    const result = PlansQuerySchema.safeParse({ technology: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('should validate tier enum', () => {
    const result = PlansQuerySchema.safeParse({ tier: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('should enforce limit range', () => {
    expect(PlansQuerySchema.safeParse({ limit: 0 }).success).toBe(false)
    expect(PlansQuerySchema.safeParse({ limit: 51 }).success).toBe(false)
    expect(PlansQuerySchema.safeParse({ limit: 50 }).success).toBe(true)
  })
})

describe('validateRequest helper', () => {
  it('should return success with data for valid input', () => {
    const result = validateRequest(ZipCodeSchema, '12345')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('12345')
    }
  })

  it('should return error details for invalid input', () => {
    const result = validateRequest(ZipCodeSchema, 'abc')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Validation failed')
      expect(result.details.length).toBeGreaterThan(0)
    }
  })
})

describe('getValidationError helper', () => {
  it('should format error message with path', () => {
    const result = validateRequest(ChatRequestSchema, { messages: [] })
    if (!result.success) {
      const errorMessage = getValidationError(result)
      expect(errorMessage).toContain('messages')
    }
  })
})
