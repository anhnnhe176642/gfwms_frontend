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

/**
 * Formats date to Vietnamese locale
 * @param date - ISO date string or Date object
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    return '-';
  }
};

/**
 * Formats time to Vietnamese locale
 * @param date - ISO date string or Date object
 * @returns Formatted time string (HH:mm)
 */
export const formatTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dateObj);
  } catch {
    return '-';
  }
};

/**
 * Formats number to Vietnamese locale with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (value: number | undefined | null, decimals: number = 0): string => {
  if (value === null || value === undefined) return '-';
  
  try {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return '-';
  }
};

/**
 * Formats currency to Vietnamese locale (VND)
 * @param value - Number to format
 * @param currency - Currency code (default: VND)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | undefined | null, currency: string = 'VND'): string => {
  if (value === null || value === undefined) return '-';
  
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return '-';
  }
};

/**
 * Formats input value for display (VND with thousand separators)
 * Converts raw number to formatted string for input display
 * @param value - String or number value from input
 * @returns Formatted string with thousand separators
 */
export const formatInputCurrency = (value: string | number): string => {
  if (!value) return '';
  
  // Remove any non-digit characters
  const numericValue = String(value).replace(/\D/g, '');
  if (!numericValue) return '';
  
  // Format with thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Unformats input value to get raw number
 * Converts formatted string back to numeric value
 * @param value - Formatted string from input
 * @returns Raw numeric value
 */
export const unformatInputCurrency = (value: string): number => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue ? Number(numericValue) : 0;
};

/**
 * Formats datetime to Vietnamese locale
 * @param date - ISO date string or Date object
 * @returns Formatted datetime string (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch {
    return '-';
  }
};

/**
 * Formats relative time (e.g., "2 giờ trước")
 * @param date - ISO date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    if (weeks < 4) return `${weeks} tuần trước`;
    if (months < 12) return `${months} tháng trước`;
    return `${years} năm trước`;
  } catch {
    return '-';
  }
};

/**
 * Export all formatters as an object for easier importing
 */
export const formatters = {
  formatDate,
  formatTime,
  formatCurrency,
  formatInputCurrency,
  unformatInputCurrency,
  formatDateTime,
  formatRelativeTime,
  formatExpirationTime,
  formatNumber,
};
