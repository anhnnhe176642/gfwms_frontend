/**
 * Formats expiration time string for display
 * Converts expiration time (e.g., "1h", "5h", "12h", "24h", "72h") to human-readable format
 * @param expiresIn - Expiration time string (e.g., "1h", "5h")
 * @returns Formatted expiration time string in Vietnamese
 */
export const formatExpirationTime = (expiresIn: string): string => {
  if (!expiresIn) return 'Không xác định';

  const match = expiresIn.match(/^(\d+)([a-z]+)$/i);
  if (!match) return expiresIn;

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  const unitMap: Record<string, string> = {
    h: numValue === 1 ? '1 giờ' : `${numValue} giờ`,
    d: numValue === 1 ? '1 ngày' : `${numValue} ngày`,
    m: numValue === 1 ? '1 phút' : `${numValue} phút`,
    s: numValue === 1 ? '1 giây' : `${numValue} giây`,
  };

  return unitMap[unit.toLowerCase()] || expiresIn;
};
