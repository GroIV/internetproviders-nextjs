/**
 * Technology Priority Sorting
 *
 * Standardized hierarchy for sorting internet providers by technology type.
 * Fiber > Cable > 5G > Fixed Wireless > DSL > Satellite
 *
 * This ensures consistent ordering across all pages that list providers.
 */

export type TechnologyType = 'Fiber' | 'Cable' | '5G' | 'Fixed Wireless' | 'DSL' | 'Satellite'

/**
 * Technology priority scores (higher = better/first)
 */
export const TECH_PRIORITY: Record<string, number> = {
  'Fiber': 100,
  'Cable': 80,
  '5G': 70,
  'Fixed Wireless': 50,
  'DSL': 30,
  'Satellite': 10,
}

/**
 * Get the priority score for a single technology
 */
export function getTechScore(technology: string): number {
  return TECH_PRIORITY[technology] || 0
}

/**
 * Get the highest priority score from an array of technologies
 */
export function getTechPriorityFromArray(technologies: string[] | null | undefined): number {
  if (!technologies || technologies.length === 0) return 0
  return Math.max(...technologies.map(t => getTechScore(t)))
}

/**
 * Sort an array of items by technology priority
 *
 * @param items - Array of items to sort
 * @param getTech - Function to extract technology/technologies from an item
 * @returns Sorted array (highest priority first)
 */
export function sortByTechPriority<T>(
  items: T[],
  getTech: (item: T) => string | string[] | null | undefined
): T[] {
  return [...items].sort((a, b) => {
    const techA = getTech(a)
    const techB = getTech(b)

    const scoreA = Array.isArray(techA)
      ? getTechPriorityFromArray(techA)
      : getTechScore(techA || '')

    const scoreB = Array.isArray(techB)
      ? getTechPriorityFromArray(techB)
      : getTechScore(techB || '')

    return scoreB - scoreA
  })
}

/**
 * Compare two technologies for sorting
 * Returns negative if a should come first, positive if b should come first
 */
export function compareTechPriority(
  techA: string | string[] | null | undefined,
  techB: string | string[] | null | undefined
): number {
  const scoreA = Array.isArray(techA)
    ? getTechPriorityFromArray(techA)
    : getTechScore(techA || '')

  const scoreB = Array.isArray(techB)
    ? getTechPriorityFromArray(techB)
    : getTechScore(techB || '')

  return scoreB - scoreA
}
