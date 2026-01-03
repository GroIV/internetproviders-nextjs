import { z } from 'zod'

// =====================================
// Common Schemas
// =====================================

export const ZipCodeSchema = z.string().regex(/^\d{5}$/, 'Invalid ZIP code format')

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// =====================================
// Chat API Schemas
// =====================================

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
})

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
  zipCode: z.string().regex(/^\d{5}$/).optional(),
  pageContext: z.string().max(500).optional(),
  sessionId: z.string().min(1).max(100).optional(),
})

export type ChatRequest = z.infer<typeof ChatRequestSchema>

// =====================================
// Admin Updates API Schemas
// =====================================

export const UpdateStatusSchema = z.enum(['pending', 'applied', 'skipped', 'expired'])
export const UpdateCategorySchema = z.enum(['pricing', 'product', 'promotion', 'discontinuation'])
export const UpdateChangeTypeSchema = z.enum(['price_increase', 'price_decrease', 'new_product', 'end_promo', 'feature_change'])

export const CreateScheduledUpdateSchema = z.object({
  provider_slug: z.string().min(1).max(100),
  provider_name: z.string().min(1).max(255),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  category: UpdateCategorySchema,
  change_type: UpdateChangeTypeSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(2000).nullish(),
  affected_table: z.string().max(100).nullish(),
  field_to_update: z.string().max(100).nullish(),
  old_value: z.string().max(500).nullish(),
  new_value: z.string().max(500).nullish(),
  sql_to_execute: z.string().max(10000).nullish(),
  source_file: z.string().max(255).nullish(),
  source_notes: z.string().max(2000).nullish(),
})

export const UpdateActionSchema = z.enum(['apply', 'skip', 'reopen', 'dry_run', 'execute_sql', 'batch_apply'])

export const PatchUpdateSchema = z.object({
  action: UpdateActionSchema.optional(),
  ids: z.array(z.number().int().positive()).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  provider_slug: z.string().min(1).max(100).optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sql_to_execute: z.string().max(10000).optional(),
  status: UpdateStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
})

export type CreateScheduledUpdate = z.infer<typeof CreateScheduledUpdateSchema>
export type PatchUpdate = z.infer<typeof PatchUpdateSchema>

// =====================================
// Availability API Schemas
// =====================================

export const AvailabilityQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  address: z.string().min(5).max(200).optional(),
}).refine(
  (data) => (data.lat !== undefined && data.lng !== undefined) || data.address !== undefined,
  { message: 'Either lat/lng coordinates or address must be provided' }
)

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>

// =====================================
// Plans API Schemas
// =====================================

export const PlansQuerySchema = z.object({
  zip: ZipCodeSchema.optional(),
  provider: z.string().min(1).max(100).optional(),
  technology: z.enum(['Fiber', 'Cable', '5G', 'Satellite', 'DSL']).optional(),
  tier: z.enum(['budget', 'value', 'premium']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type PlansQuery = z.infer<typeof PlansQuerySchema>

// =====================================
// Provider API Schemas
// =====================================

export const ProvidersByZipSchema = z.object({
  zip: ZipCodeSchema,
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type ProvidersByZip = z.infer<typeof ProvidersByZipSchema>

// =====================================
// Guides API Schemas
// =====================================

export const GuidesQuerySchema = z.object({
  category: z.string().min(1).max(50).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export type GuidesQuery = z.infer<typeof GuidesQuerySchema>

// =====================================
// Validation Helper
// =====================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T
} | {
  success: false;
  error: string;
  details: z.ZodIssue[]
} {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: 'Validation failed',
    details: result.error.issues,
  }
}

// Helper to extract error message for API responses
export function getValidationError(result: { success: false; error: string; details: z.ZodIssue[] }): string {
  const firstIssue = result.details[0]
  if (firstIssue) {
    const path = firstIssue.path.join('.')
    return path ? `${path}: ${firstIssue.message}` : firstIssue.message
  }
  return result.error
}
