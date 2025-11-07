/**
 * Danh sách các giá trị được loại trừ (không phải ID)
 * Được sử dụng để tránh match các route hành động (create, edit, v.v.) với pattern ID động
 */
const EXCLUDED_ID_VALUES = ['create', 'edit', 'import', 'export', 'shelves', 'categories', 'colors', 'suppliers'];

/**
 * Utility function để extract ID từ URL pathname dựa trên pattern
 * @param pathname - Đường dẫn hiện tại (từ usePathname())
 * @param pattern - Pattern của URL (VD: '/admin/warehouses/:id')
 * @param excludedValues - Danh sách giá trị loại trừ (optional, sử dụng mặc định nếu không có)
 * @returns ID nếu tìm thấy, null nếu không
 * @example
 * // Extract single ID
 * const warehouseId = extractIdFromPath(pathname, '/admin/warehouses/:id');
 * // Extract multiple IDs
 * const ids = extractIdsFromPath(pathname, '/admin/warehouses/:warehouseId/shelves/:shelfId');
 * console.log(ids.warehouseId, ids.shelfId);
 * // Custom excluded values
 * const id = extractIdFromPath(pathname, '/admin/items/:id', ['new', 'draft']);
 */
export const extractIdFromPath = (
  pathname: string,
  pattern: string,
  excludedValues: string[] = EXCLUDED_ID_VALUES
): string | null => {
  // Chuyển pattern thành regex
  // VD: '/admin/warehouses/:id' -> /\/admin\/warehouses\/([^/]+)/
  const regexPattern = pattern
    .replace(/\//g, '\\/')
    .replace(/:[a-zA-Z]+/g, '([^/]+)');
  
  const regex = new RegExp(`^${regexPattern}(?:/|$)`);
  const match = pathname.match(regex);
  
  const extracted = match ? match[1] : null;
  
  // Loại trừ các giá trị không phải ID
  if (extracted && excludedValues.includes(extracted.toLowerCase())) {
    return null;
  }
  
  return extracted;
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