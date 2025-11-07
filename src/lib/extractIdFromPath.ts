/**
 * Utility function để extract ID từ URL pathname dựa trên pattern
 * @param pathname - Đường dẫn hiện tại (từ usePathname())
 * @param pattern - Pattern của URL (VD: '/admin/warehouses/:id')
 * @returns ID nếu tìm thấy, null nếu không
 * @example
 * // Extract single ID
 * const warehouseId = extractIdFromPath(pathname, '/admin/warehouses/:id');
 * // Extract multiple IDs
 * const ids = extractIdsFromPath(pathname, '/admin/warehouses/:warehouseId/shelves/:shelfId');
 * console.log(ids.warehouseId, ids.shelfId);
 */
export const extractIdFromPath = (pathname: string, pattern: string): string | null => {
  // Chuyển pattern thành regex
  // VD: '/admin/warehouses/:id' -> /\/admin\/warehouses\/([^/]+)/
  const regexPattern = pattern
    .replace(/\//g, '\\/')
    .replace(/:[a-zA-Z]+/g, '([^/]+)');
  
  const regex = new RegExp(`^${regexPattern}(?:/|$)`);
  const match = pathname.match(regex);
  
  return match ? match[1] : null;
};

/**
 * Utility function để extract multiple IDs từ URL pathname
 * @param pathname - Đường dẫn hiện tại
 * @param pattern - Pattern của URL (VD: '/admin/warehouses/:warehouseId/shelves/:shelfId')
 * @returns Object chứa các ID đã extract
 */
export const extractIdsFromPath = (
  pathname: string,
  pattern: string
): Record<string, string> => {
  // Tìm tất cả tham số trong pattern
  const paramNames = (pattern.match(/:[a-zA-Z]+/g) || []).map(p => p.slice(1));
  
  // Chuyển pattern thành regex
  const regexPattern = pattern
    .replace(/\//g, '\\/')
    .replace(/:[a-zA-Z]+/g, '([^/]+)');
  
  const regex = new RegExp(`^${regexPattern}(?:/|$)`);
  const match = pathname.match(regex);
  
  const result: Record<string, string> = {};
  
  if (match) {
    paramNames.forEach((name, index) => {
      result[name] = match[index + 1];
    });
  }
  
  return result;
};