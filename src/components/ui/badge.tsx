import { cn } from "@/lib/utils";

export type BadgeConfig<T extends string = string> = {
  label: string;
  className: string;
  value: T;
};

type BadgeProps<T extends string = string> = {
  value: T;
  config: Record<T, BadgeConfig<T>>;
  fallback?: BadgeConfig<T>;
  className?: string;
};

/**
 * Generic Badge component
 * Can be used for status, role, or any enum-based values
 * 
 * @example
 * // For status badge
 * <Badge value="ACTIVE" config={USER_STATUS_CONFIG} />
 * 
 * // For role badge
 * <Badge value="ADMIN" config={USER_ROLE_CONFIG} />
 * 
 * // With custom fallback
 * <Badge value={unknownValue} config={CONFIG} fallback={DEFAULT_CONFIG} />
 */
export function Badge<T extends string = string>({
  value,
  config,
  fallback,
  className,
}: BadgeProps<T>) {
  const itemConfig = config[value] || fallback;

  if (!itemConfig) {
    return <span className="text-gray-500 text-sm">-</span>;
  }

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        itemConfig.className,
        className
      )}
    >
      {itemConfig.label}
    </span>
  );
}
