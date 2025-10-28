/**
 * Định nghĩa tất cả các quyền trong hệ thống
 * Mỗi quyền có key (string để so sánh với backend) và description (mô tả tiếng Việt)
 */

export type Permission = {
  key: string;
  description: string;
};

// Định nghĩa permissions với cả key và description
export const PERMISSIONS = {
  // User Management
  USERS: {
    VIEW_LIST:          { key: 'user:view_list',          description: 'Xem danh sách người dùng' },
    VIEW_DETAIL:        { key: 'user:view_detail',        description: 'Xem chi tiết người dùng' },
    CREATE:             { key: 'user:create',             description: 'Tạo người dùng mới' },
    UPDATE:             { key: 'user:update',             description: 'Cập nhật thông tin người dùng' },
    DELETE:             { key: 'user:delete',             description: 'Xóa người dùng' },
    MANAGE_ROLES:       { key: 'user:manage_roles',       description: 'Quản lý vai trò người dùng' },
    CHANGE_STATUS:      { key: 'user:change_status',      description: 'Thay đổi trạng thái người dùng' },
    VIEW_OWN_PROFILE:   { key: 'user:view_own_profile',   description: 'Xem hồ sơ cá nhân' },
    UPDATE_OWN_PROFILE: { key: 'user:update_own_profile', description: 'Cập nhật hồ sơ cá nhân' }
  },
  
  // Fabric Management
  FABRICS: {
    VIEW_LIST:          { key: 'fabric:view_list',          description: 'Xem danh sách vải' },
    VIEW_DETAIL:        { key: 'fabric:view_detail',        description: 'Xem chi tiết vải' },
    CREATE:             { key: 'fabric:create',             description: 'Tạo vải mới' },
    UPDATE:             { key: 'fabric:update',             description: 'Cập nhật thông tin vải' },
    DELETE:             { key: 'fabric:delete',             description: 'Xóa vải' },
    MANAGE_CATEGORIES:  { key: 'fabric:manage_categories',  description: 'Quản lý danh mục vải' },
    MANAGE_COLORS:      { key: 'fabric:manage_colors',      description: 'Quản lý màu sắc vải' },
    MANAGE_GLOSS:       { key: 'fabric:manage_gloss',       description: 'Quản lý độ bóng vải' },
    MANAGE_SUPPLIER:    { key: 'fabric:manage_supplier',    description: 'Quản lý nhà cung cấp vải' }
  },

  // Warehouse Management
  WAREHOUSES: {
    VIEW_LIST:    { key: 'warehouse:view_list',    description: 'Xem danh sách kho' },
    VIEW_DETAIL:  { key: 'warehouse:view_detail',  description: 'Xem chi tiết kho' },
    CREATE:       { key: 'warehouse:create',       description: 'Tạo kho mới' },
    UPDATE:       { key: 'warehouse:update',       description: 'Cập nhật thông tin kho' },
    DELETE:       { key: 'warehouse:delete',       description: 'Xóa kho (soft delete)' },
    MANAGE_STATUS:{ key: 'warehouse:manage_status',description: 'Quản lý trạng thái kho' }
  },
  
  // Credit Registration
  CREDITS: {
    VIEW_LIST:   { key: 'credit:view_list',   description: 'Xem danh sách đăng ký tín dụng' },
    VIEW_DETAIL: { key: 'credit:view_detail', description: 'Xem chi tiết đăng ký tín dụng' },
    CREATE:      { key: 'credit:create',      description: 'Tạo đăng ký tín dụng mới' },
    UPDATE:      { key: 'credit:update',      description: 'Cập nhật đăng ký tín dụng' },
    DELETE:      { key: 'credit:delete',      description: 'Xóa đăng ký tín dụng' },
    APPROVE:     { key: 'credit:approve',     description: 'Phê duyệt đăng ký tín dụng' },
    REJECT:      { key: 'credit:reject',      description: 'Từ chối đăng ký tín dụng' },
    VIEW_OWN:    { key: 'credit:view_own',    description: 'Xem đăng ký tín dụng của mình' }
  },
  
  // Role Management
  ROLES: {
    VIEW:   { key: 'role:view',   description: 'Xem danh sách vai trò' },
    CREATE: { key: 'role:create', description: 'Tạo vai trò mới' },
    UPDATE: { key: 'role:update', description: 'Cập nhật vai trò' },
    DELETE: { key: 'role:delete', description: 'Xóa vai trò' }
  },
  
  // System Administration
  SYSTEM: {
    VIEW_AUDIT_LOGS:     { key: 'system:view_audit_logs',     description: 'Xem nhật ký kiểm tra hệ thống' },
    MANAGE_PERMISSIONS:  { key: 'system:manage_permissions',  description: 'Quản lý quyền hạn hệ thống' },
    MANAGE_ROLES:        { key: 'system:manage_roles',        description: 'Quản lý vai trò hệ thống' },
    SYSTEM_CONFIG:       { key: 'system:config',              description: 'Cấu hình hệ thống' }
  },

  // Invoice Management 
  INVOICES: {
    VIEW_LIST:    { key: 'invoice:view_list',    description: 'Xem danh sách hóa đơn' },
    VIEW_DETAIL:  { key: 'invoice:view_detail',  description: 'Xem chi tiết hóa đơn' },
  },

  // Export Fabric Management
  EXPORT_FABRICS: {
    VIEW_LIST:    { key: 'exportFabric:view_list',    description: 'Xem danh sách các đơn yêu cầu xuất kho' },
    VIEW_DETAIL:  { key: 'exportFabric:view_detail',  description: 'Xem chi tiết các đơn yêu cầu xuất kho' },
  },
} as const;

/**
 * Helper để lấy tất cả permission keys dưới dạng array
 */
export const getAllPermissionKeys = (): string[] => {
  const keys: string[] = [];
  Object.values(PERMISSIONS).forEach((category) => {
    Object.values(category).forEach((perm) => {
      keys.push(perm.key);
    });
  });
  return keys;
};

/**
 * Helper để tìm permission theo key
 */
export const findPermissionByKey = (key: string): Permission | undefined => {
  for (const category of Object.values(PERMISSIONS)) {
    for (const perm of Object.values(category)) {
      if (perm.key === key) {
        return perm;
      }
    }
  }
  return undefined;
};
