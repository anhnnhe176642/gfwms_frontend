import type { BadgeConfig } from "@/components/ui/badge";

/**
 * Factory function to create configuration objects for enums
 * Makes it easy to create reusable configs for status, role, type, etc.
 * 
 * @example
 * const PRODUCT_STATUS_CONFIG = createEnumConfig<ProductStatus>({
 *   IN_STOCK: { label: 'Còn hàng', className: 'bg-green-100 text-green-800' },
 *   OUT_OF_STOCK: { label: 'Hết hàng', className: 'bg-red-100 text-red-800' },
 * });
 */
export function createEnumConfig<T extends string>(
  config: Record<T, Omit<BadgeConfig<T>, "value">>
): Record<T, BadgeConfig<T>> {
  const result = {} as Record<T, BadgeConfig<T>>;

  for (const key in config) {
    result[key] = {
      ...config[key],
      value: key,
    } as BadgeConfig<T>;
  }

  return result;
}

/**
 * Helper to convert config object to array of options
 * Useful for select/filter dropdowns
 */
export function configToOptions<T extends string>(
  config: Record<T, BadgeConfig<T>>
): BadgeConfig<T>[] {
  return Object.values(config);
}

/**
 * Helper to get config with optional fallback
 * Returns undefined if not found and no fallback provided
 */
export function getConfig<T extends string>(
  value: T,
  config: Record<T, BadgeConfig<T>>,
  fallback?: BadgeConfig<T>
): BadgeConfig<T> | undefined {
  return config[value] || fallback;
}
