/**
 * Định nghĩa tất cả các quyền trong hệ thống theo cấu trúc thư mục Admin
 * - Cấu trúc tree dựa trên tổ chức thư mục của frontend
 * - Yêu cầu `system:admin` để truy cập bất kỳ trang nào trong admin
 * - Quyền cha phải được có trước khi có thể có quyền con (vd: cần view_list mới có thể có create)
 */

export type Permission = {
  key: string;
  description: string;
  /**
   * Quyền cha - phải có quyền này trước khi có thể có quyền con
   * Nếu không, không có ràng buộc phụ thuộc
   */
  parentPermissionKey?: string;
  /**
   * Mức độ trong hierarchy (0 = root, 1 = parent, 2 = child, v.v)
   */
  level?: number;
};

export type PermissionTreeNode = {
  key: string;
  description: string;
  level: number;
  children: PermissionTreeNode[];
  /**
   * Nếu parent không có, quyền này không thể được chọn
   */
  parentKey?: string;
};

// Định nghĩa permissions theo cấu trúc tree
export const PERMISSIONS = {
  // System Administration - Yêu cầu để truy cập Admin
  SYSTEM: {
    ADMIN: {
      key: 'system:admin',
      description: 'Quản trị hệ thống (Yêu cầu để truy cập Admin)',
      level: 0,
    },
    VIEW_AUDIT_LOGS: {
      key: 'system:view_audit_logs',
      description: 'Xem nhật ký kiểm tra hệ thống',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    MANAGE_PERMISSIONS: {
      key: 'system:manage_permissions',
      description: 'Quản lý quyền hạn hệ thống',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    MANAGE_ROLES: {
      key: 'system:manage_roles',
      description: 'Quản lý vai trò hệ thống',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    SYSTEM_CONFIG: {
      key: 'system:config',
      description: 'Cấu hình hệ thống',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
  },

  // Fabrics Management (admin/fabrics)
  FABRICS: {
    VIEW_LIST: {
      key: 'fabric:view_list',
      description: 'Xem danh sách vải',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'fabric:view_detail',
      description: 'Xem chi tiết vải',
      parentPermissionKey: 'fabric:view_list',
      level: 2,
    },
    CREATE: {
      key: 'fabric:create',
      description: 'Tạo vải mới',
      parentPermissionKey: 'fabric:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'fabric:update',
      description: 'Cập nhật thông tin vải',
      parentPermissionKey: 'fabric:view_list',
      level: 2,
    },
    DELETE: {
      key: 'fabric:delete',
      description: 'Xóa vải',
      parentPermissionKey: 'fabric:view_list',
      level: 2,
    },
    MANAGE_CATEGORIES: {
      key: 'fabric:manage_categories',
      description: 'Quản lý loại vải',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    MANAGE_COLORS: {
      key: 'fabric:manage_colors',
      description: 'Quản lý màu sắc vải',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    MANAGE_GLOSS: {
      key: 'fabric:manage_gloss',
      description: 'Quản lý độ bóng vải',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    MANAGE_SUPPLIER: {
      key: 'fabric:manage_supplier',
      description: 'Quản lý nhà cung cấp vải',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    ALLOCATE_TO_SHELF: {
      key: 'fabric:allocate_to_shelf',
      description: 'Thêm vải vào các kệ',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
  },

  // Import Fabrics (admin/import-fabrics)
  IMPORT_FABRICS: {
    VIEW_LIST: {
      key: 'import_fabrics:view_list',
      description: 'Xem danh sách phiếu nhập vải',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'import_fabrics:view_detail',
      description: 'Xem chi tiết phiếu nhập vải',
      parentPermissionKey: 'import_fabrics:view_list',
      level: 2,
    },
    CREATE: {
      key: 'import_fabrics:create',
      description: 'Tạo phiếu nhập vải',
      parentPermissionKey: 'import_fabrics:view_list',
      level: 2,
    },
    SET_SELLING_PRICE: {
      key: 'import_fabrics:set_selling_price',
      description: 'Nhập giá bán khi import vải',
      parentPermissionKey: 'import_fabrics:create',
      level: 3,
    },
  },

  // Roles (admin/roles)
  ROLES: {
    VIEW_LIST: {
      key: 'role:view_list',
      description: 'Xem danh sách vai trò',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'role:view_detail',
      description: 'Xem chi tiết vai trò',
      parentPermissionKey: 'role:view_list',
      level: 2,
    },
    CREATE: {
      key: 'role:create',
      description: 'Tạo vai trò mới',
      parentPermissionKey: 'role:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'role:update',
      description: 'Cập nhật vai trò',
      parentPermissionKey: 'role:view_list',
      level: 2,
    },
    DELETE: {
      key: 'role:delete',
      description: 'Xóa vai trò',
      parentPermissionKey: 'role:view_list',
      level: 2,
    },
  },

  // Stores (admin/stores)
  STORES: {
    VIEW_LIST: {
      key: 'store:view_list',
      description: 'Xem danh sách cửa hàng',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'store:view_detail',
      description: 'Xem chi tiết cửa hàng',
      parentPermissionKey: 'store:view_list',
      level: 2,
    },
    CREATE: {
      key: 'store:create',
      description: 'Tạo cửa hàng mới',
      parentPermissionKey: 'store:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'store:update',
      description: 'Cập nhật thông tin cửa hàng',
      parentPermissionKey: 'store:view_list',
      level: 2,
    },
    DELETE: {
      key: 'store:delete',
      description: 'Xóa cửa hàng (soft delete)',
      parentPermissionKey: 'store:view_list',
      level: 2,
    },
  },

  // Users (admin/users)
  USERS: {
    VIEW_LIST: {
      key: 'user:view_list',
      description: 'Xem danh sách người dùng',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'user:view_detail',
      description: 'Xem chi tiết người dùng',
      parentPermissionKey: 'user:view_list',
      level: 2,
    },
    CREATE: {
      key: 'user:create',
      description: 'Tạo người dùng mới',
      parentPermissionKey: 'user:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'user:update',
      description: 'Cập nhật thông tin người dùng',
      parentPermissionKey: 'user:view_list',
      level: 2,
    },
    DELETE: {
      key: 'user:delete',
      description: 'Xóa người dùng',
      parentPermissionKey: 'user:view_list',
      level: 2,
    },
    MANAGE_ROLES: {
      key: 'user:manage_roles',
      description: 'Quản lý vai trò người dùng',
      parentPermissionKey: 'user:view_list',
      level: 2,
    },
    CHANGE_STATUS: {
      key: 'user:change_status',
      description: 'Thay đổi trạng thái người dùng',
      parentPermissionKey: 'user:view_list',
      level: 2,
    },
    VIEW_OWN_PROFILE: {
      key: 'user:view_own_profile',
      description: 'Xem hồ sơ cá nhân',
      level: 0,
    },
    UPDATE_OWN_PROFILE: {
      key: 'user:update_own_profile',
      description: 'Cập nhật hồ sơ cá nhân',
      level: 0,
    },
  },

  // Warehouses (admin/warehouses)
  WAREHOUSES: {
    VIEW_LIST: {
      key: 'warehouse:view_list',
      description: 'Xem danh sách kho',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'warehouse:view_detail',
      description: 'Xem chi tiết kho',
      parentPermissionKey: 'warehouse:view_list',
      level: 2,
    },
    CREATE: {
      key: 'warehouse:create',
      description: 'Tạo kho mới',
      parentPermissionKey: 'warehouse:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'warehouse:update',
      description: 'Cập nhật thông tin kho',
      parentPermissionKey: 'warehouse:view_list',
      level: 2,
    },
    DELETE: {
      key: 'warehouse:delete',
      description: 'Xóa kho (soft delete)',
      parentPermissionKey: 'warehouse:view_list',
      level: 2,
    },
    MANAGE_STATUS: {
      key: 'warehouse:manage_status',
      description: 'Quản lý trạng thái kho',
      parentPermissionKey: 'warehouse:view_list',
      level: 2,
    },
  },

  // Shelf Management
  SHELVES: {
    VIEW_LIST: {
      key: 'shelf:view_list',
      description: 'Xem danh sách kệ trong kho',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'shelf:view_detail',
      description: 'Xem chi tiết kệ',
      parentPermissionKey: 'shelf:view_list',
      level: 2,
    },
    CREATE: {
      key: 'shelf:create',
      description: 'Tạo kệ mới',
      parentPermissionKey: 'shelf:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'shelf:update',
      description: 'Cập nhật thông tin kệ',
      parentPermissionKey: 'shelf:view_list',
      level: 2,
    },
    DELETE: {
      key: 'shelf:delete',
      description: 'Xóa kệ (soft delete)',
      parentPermissionKey: 'shelf:view_list',
      level: 2,
    },
  },

  // Credit Registration
  CREDITS: {
    VIEW_LIST: {
      key: 'credit:view_list',
      description: 'Xem danh sách đăng ký tín dụng',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'credit:view_detail',
      description: 'Xem chi tiết đăng ký tín dụng',
      parentPermissionKey: 'credit:view_list',
      level: 2,
    },
    CREATE: {
      key: 'credit:create',
      description: 'Tạo đăng ký tín dụng mới',
      parentPermissionKey: 'credit:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'credit:update',
      description: 'Cập nhật đăng ký tín dụng',
      parentPermissionKey: 'credit:view_list',
      level: 2,
    },
    DELETE: {
      key: 'credit:delete',
      description: 'Xóa đăng ký tín dụng',
      parentPermissionKey: 'credit:view_list',
      level: 2,
    },
    APPROVE: {
      key: 'credit:approve',
      description: 'Phê duyệt đăng ký tín dụng',
      parentPermissionKey: 'credit:view_list',
      level: 2,
    },
    REJECT: {
      key: 'credit:reject',
      description: 'Từ chối đăng ký tín dụng',
      parentPermissionKey: 'credit:view_list',
      level: 2,
    },
    VIEW_OWN: {
      key: 'credit:view_own',
      description: 'Xem đăng ký tín dụng của mình',
      level: 0,
    },
  },

  // Invoice Management
  INVOICES: {
    VIEW_LIST: {
      key: 'invoice:view_list',
      description: 'Xem danh sách hóa đơn',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'invoice:view_detail',
      description: 'Xem chi tiết hóa đơn',
      parentPermissionKey: 'invoice:view_list',
      level: 2,
    },
  },

  // Export Fabric Management
  EXPORT_FABRICS: {
    VIEW_LIST: {
      key: 'exportFabric:view_list',
      description: 'Xem danh sách các đơn yêu cầu xuất kho',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'exportFabric:view_detail',
      description: 'Xem chi tiết các đơn yêu cầu xuất kho',
      parentPermissionKey: 'exportFabric:view_list',
      level: 2,
    },
    VIEW_DETAIL_WAREHOUSE: {
      key: 'exportFabric:view_detail_warehouse',
      description: 'Xem chi tiết các đơn yêu cầu xuất kho (warehouse)',
      parentPermissionKey: 'exportFabric:view_list',
      level: 2,
    },
    CREATE: {
      key: 'exportFabric:create',
      description: 'Tạo đơn yêu cầu xuất kho mới',
      parentPermissionKey: 'exportFabric:view_list',
      level: 2,
    },
    CHANGE_STATUS: {
      key: 'exportFabric:change_status',
      description: 'Thay đổi trạng thái đơn',
      parentPermissionKey: 'exportFabric:view_list',
      level: 2,
    },
  },

  // YOLO (legacy - for backward compatibility)
  YOLO: {
    DETECT: {
      key: 'yolo:detect',
      description: 'Phát hiện đối tượng trong hình ảnh',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_MODELS: {
      key: 'yolo:view_models',
      description: 'Xem danh sách các model YOLO',
      parentPermissionKey: 'yolo:detect',
      level: 2,
    },
    VIEW_MODEL: {
      key: 'yolo:view_model',
      description: 'Xem chi tiết model YOLO',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    UPLOAD_MODEL: {
      key: 'yolo:upload_model',
      description: 'Tải lên model YOLO mới',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    ACTIVATE_MODEL: {
      key: 'yolo:activate_model',
      description: 'Kích hoạt model YOLO',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    UPDATE_MODEL: {
      key: 'yolo:update_model',
      description: 'Cập nhật thông tin model YOLO',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    DELETE_MODEL: {
      key: 'yolo:delete_model',
      description: 'Xóa model YOLO',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    VIEW_LOGS: {
      key: 'yolo:view_logs',
      description: 'Xem logs phát hiện của model',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    VIEW_STATS: {
      key: 'yolo:view_stats',
      description: 'Xem thống kê model YOLO',
      parentPermissionKey: 'yolo:view_models',
      level: 3,
    },
    VIEW_DATASET: {
      key: 'yolo:view_dataset',
      description: 'Xem dataset YOLO',
      parentPermissionKey: 'yolo:detect',
      level: 2,
    },
    MANAGE_DATASET: {
      key: 'yolo:manage_dataset',
      description: 'Quản lý dataset YOLO (tạo, cập nhật, xóa, thêm ảnh)',
      parentPermissionKey: 'yolo:view_dataset',
      level: 3,
    },
    EXPORT_DATASET: {
      key: 'yolo:export_dataset',
      description: 'Xuất dataset YOLO dưới dạng ZIP',
      parentPermissionKey: 'yolo:view_dataset',
      level: 3,
    },
  },

  // Order Management
  ORDERS: {
    CREATE_ONLINE: {
      key: 'order:create_online',
      description: 'Tạo đơn hàng online (customer)',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    CREATE_OFFLINE: {
      key: 'order:create_offline',
      description: 'Tạo đơn hàng offline tại cửa hàng (staff)',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_MY: {
      key: 'order:view_my',
      description: 'Xem danh sách đơn hàng của tôi (customer)',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_LIST: {
      key: 'order:view_list',
      description: 'Xem danh sách đơn hàng',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'order:view_detail',
      description: 'Xem chi tiết đơn hàng',
      parentPermissionKey: 'order:view_list',
      level: 2,
    },
    UPDATE_STATUS: {
      key: 'order:update_status',
      description: 'Cập nhật trạng thái đơn hàng',
      parentPermissionKey: 'order:view_list',
      level: 2,
    },
    CANCEL: {
      key: 'order:cancel',
      description: 'Hủy đơn hàng',
      parentPermissionKey: 'order:view_list',
      level: 2,
    },
    CONFIRM_PAYMENT: {
      key: 'order:confirm_payment',
      description: 'Xác nhận thanh toán',
      parentPermissionKey: 'order:view_list',
      level: 2,
    },
    CHECK_CUSTOMER_CREDIT: {
      key: 'order:check_customer_credit',
      description: 'Kiểm tra tín dụng khách hàng',
      parentPermissionKey: 'order:view_list',
      level: 2,
    },
  },

  // Banner Management
  BANNERS: {
    VIEW_LIST: {
      key: 'banner:view_list',
      description: 'Xem danh sách banner',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'banner:view_detail',
      description: 'Xem chi tiết banner',
      parentPermissionKey: 'banner:view_list',
      level: 2,
    },
    CREATE: {
      key: 'banner:create',
      description: 'Tạo banner mới',
      parentPermissionKey: 'banner:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'banner:update',
      description: 'Cập nhật thông tin banner',
      parentPermissionKey: 'banner:view_list',
      level: 2,
    },
    DELETE: {
      key: 'banner:delete',
      description: 'Xóa banner (soft delete)',
      parentPermissionKey: 'banner:view_list',
      level: 2,
    },
  },

  // Banner Discount Management
  BANNER_DISCOUNTS: {
    VIEW_LIST: {
      key: 'banner_discount:view_list',
      description: 'Xem danh sách banner_discount',
      parentPermissionKey: 'system:admin',
      level: 1,
    },
    VIEW_DETAIL: {
      key: 'banner_discount:view_detail',
      description: 'Xem chi tiết banner_discount',
      parentPermissionKey: 'banner_discount:view_list',
      level: 2,
    },
    CREATE: {
      key: 'banner_discount:create',
      description: 'Tạo banner_discount mới',
      parentPermissionKey: 'banner_discount:view_list',
      level: 2,
    },
    UPDATE: {
      key: 'banner_discount:update',
      description: 'Cập nhật thông tin banner_discount',
      parentPermissionKey: 'banner_discount:view_list',
      level: 2,
    },
    DELETE: {
      key: 'banner_discount:delete',
      description: 'Xóa banner_discount (soft delete)',
      parentPermissionKey: 'banner_discount:view_list',
      level: 2,
    },
  },
} as const;

/**
 * Helper: Lấy tất cả permissions dưới dạng flat array
 */
export const getAllPermissions = (): Permission[] => {
  const permissions: Permission[] = [];
  Object.values(PERMISSIONS).forEach((category) => {
    Object.values(category).forEach((perm) => {
      permissions.push(perm as Permission);
    });
  });
  return permissions;
};

/**
 * Helper: Lấy tất cả permission keys
 */
export const getAllPermissionKeys = (): string[] => {
  return getAllPermissions().map(p => p.key);
};

/**
 * Helper: Tìm permission theo key
 */
export const findPermissionByKey = (key: string): Permission | undefined => {
  return getAllPermissions().find(p => p.key === key);
};

/**
 * Helper: Lấy tất cả children permissions của một parent (recursive - tất cả descendants)
 */
export const getChildPermissions = (parentKey: string): Permission[] => {
  return getAllPermissions().filter(p => p.parentPermissionKey === parentKey);
};

/**
 * Helper: Lấy tất cả descendants (children + grandchildren + ...) của một parent
 */
export const getAllDescendants = (parentKey: string): Permission[] => {
  const result: Permission[] = [];
  const queue = [parentKey];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);

    const children = getChildPermissions(key);
    result.push(...children);
    children.forEach(child => queue.push(child.key));
  }

  return result;
};

/**
 * Helper: Kiểm tra xem permission có parent không
 */
export const hasParent = (permissionKey: string): boolean => {
  const perm = findPermissionByKey(permissionKey);
  return perm?.parentPermissionKey !== undefined;
};

/**
 * Helper: Kiểm tra xem bộ permissions có hợp lệ không (tất cả parent phải có)
 * @param selectedKeys - Các permission keys được chọn
 * @returns Mảng các keys bị thiếu parent
 */
export const validatePermissionHierarchy = (selectedKeys: string[]): string[] => {
  const selectedSet = new Set(selectedKeys);
  const missingParents: string[] = [];

  for (const key of selectedKeys) {
    const perm = findPermissionByKey(key);
    if (perm?.parentPermissionKey && !selectedSet.has(perm.parentPermissionKey)) {
      missingParents.push(perm.parentPermissionKey);
    }
  }

  return Array.from(new Set(missingParents));
};

/**
 * Helper: Thêm tất cả parent permissions khi chọn một permission
 * @param selectedKeys - Các permission keys được chọn
 * @returns Mảng keys được cập nhật với tất cả parents
 */
export const addParentPermissions = (selectedKeys: string[]): string[] => {
  const result = new Set(selectedKeys);
  const queue = [...selectedKeys];

  while (queue.length > 0) {
    const key = queue.shift()!;
    const perm = findPermissionByKey(key);

    if (perm?.parentPermissionKey && !result.has(perm.parentPermissionKey)) {
      result.add(perm.parentPermissionKey);
      queue.push(perm.parentPermissionKey);
    }
  }

  return Array.from(result);
};

/**
 * Helper: Xây dựng tree structure từ flat permissions
 */
export const buildPermissionTree = (selectedKeys: string[] = []): PermissionTreeNode[] => {
  const selectedSet = new Set(selectedKeys);
  const allPerms = getAllPermissions();
  
  // Tìm root permissions (không có parent)
  const roots = allPerms.filter(p => !p.parentPermissionKey);

  const buildNode = (perm: Permission): PermissionTreeNode => {
    const children = allPerms
      .filter(p => p.parentPermissionKey === perm.key)
      .map(buildNode);

    return {
      key: perm.key,
      description: perm.description,
      level: perm.level ?? 0,
      children,
      parentKey: perm.parentPermissionKey,
    };
  };

  return roots.map(buildNode);
};
