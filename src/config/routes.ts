import { PERMISSIONS } from '@/constants/permissions';

/**
 * Định nghĩa route config với quyền truy cập
 */
export type RouteConfig = {
  path: string;
  name: string;
  description?: string;
  requiredPermission?: string; // Permission key cần thiết để truy cập
  requiredPermissions?: string[]; // Nhiều permissions (AND logic)
  anyPermissions?: string[]; // Bất kỳ permission nào (OR logic)
  isPublic?: boolean; // Route công khai (không cần auth)
  exactMatch?: boolean; // Chỉ match exact path
};

/**
 * Cấu hình tất cả routes trong hệ thống
 */
export const ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: {
      path: '/',
      name: 'Trang chủ',
      isPublic: true,
    },
    LOGIN: {
      path: '/auth/login',
      name: 'Đăng nhập',
      isPublic: true,
    },
    REGISTER: {
      path: '/auth/register',
      name: 'Đăng ký',
      isPublic: true,
    },
    VERIFY_EMAIL: {
      path: '/auth/verify-email',
      name: 'Xác thực Email',
      description: 'Xác thực địa chỉ email',
      isPublic: true,
    },
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: {
      path: '/admin/dashboard',
      name: 'Dashboard',
      description: 'Trang tổng quan quản trị',
      // Dashboard không yêu cầu quyền cụ thể, chỉ cần đăng nhập
    },
    
    // User Management
    USERS: {
      LIST: {
        path: '/admin/users',
        name: 'Quản lý người dùng',
        description: 'Danh sách người dùng',
        requiredPermission: PERMISSIONS.USERS.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/users/:id',
        name: 'Chi tiết người dùng',
        requiredPermission: PERMISSIONS.USERS.VIEW_DETAIL.key,
      },
      CREATE: {
        path: '/admin/users/create',
        name: 'Tạo người dùng',
        requiredPermission: PERMISSIONS.USERS.CREATE.key,
      },
      EDIT: {
        path: '/admin/users/:id/edit',
        name: 'Chỉnh sửa người dùng',
        requiredPermission: PERMISSIONS.USERS.UPDATE.key,
      },
    },

    // Fabric Management
    FABRICS: {
      LIST: {
        path: '/admin/fabrics',
        name: 'Quản lý vải',
        description: 'Danh sách vải',
        requiredPermission: PERMISSIONS.FABRICS.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/fabrics/:id',
        name: 'Chi tiết vải',
        requiredPermission: PERMISSIONS.FABRICS.VIEW_DETAIL.key,
      },
      CREATE: {
        path: '/admin/fabrics/create',
        name: 'Tạo vải mới',
        requiredPermission: PERMISSIONS.FABRICS.CREATE.key,
      },
      EDIT: {
        path: '/admin/fabrics/:id/edit',
        name: 'Chỉnh sửa vải',
        requiredPermission: PERMISSIONS.FABRICS.UPDATE.key,
      },
      CATEGORIES: {
        path: '/admin/fabrics/categories',
        name: 'loại vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key,
      },
      CATEGORIES_CREATE: {
        path: '/admin/fabrics/categories/create',
        name: 'Tạo loại vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key,
      },
      CATEGORIES_DETAIL: {
        path: '/admin/fabrics/categories/:id',
        name: 'Chi tiết loại vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key,
      },
      CATEGORIES_EDIT: {
        path: '/admin/fabrics/categories/:id/edit',
        name: 'Chỉnh sửa loại vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key,
      },
      COLORS: {
        path: '/admin/fabrics/colors',
        name: 'Màu sắc vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_COLORS.key,
      },
      COLORS_CREATE: {
        path: '/admin/fabrics/colors/create',
        name: 'Tạo màu vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_COLORS.key,
      },
      COLORS_DETAIL: {
        path: '/admin/fabrics/colors/:id',
        name: 'Chi tiết màu vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_COLORS.key,
      },
      COLORS_EDIT: {
        path: '/admin/fabrics/colors/:id/edit',
        name: 'Chỉnh sửa màu vải',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_COLORS.key,
      },
      SUPPLIERS: {
        path: '/admin/fabrics/suppliers',
        name: 'Nhà cung cấp',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.key,
      },
      SUPPLIERS_CREATE: {
        path: '/admin/fabrics/suppliers/create',
        name: 'Tạo nhà cung cấp',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.key,
      },
      SUPPLIERS_DETAIL: {
        path: '/admin/fabrics/suppliers/:id',
        name: 'Chi tiết nhà cung cấp',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.key,
      },
      SUPPLIERS_EDIT: {
        path: '/admin/fabrics/suppliers/:id/edit',
        name: 'Chỉnh sửa nhà cung cấp',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.key,
      },
      GLOSS: {
        path: '/admin/fabrics/gloss',
        name: 'Độ bóng',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_GLOSS.key,
      },
      GLOSS_CREATE: {
        path: '/admin/fabrics/gloss/create',
        name: 'Tạo độ bóng',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_GLOSS.key,
      },
      GLOSS_DETAIL: {
        path: '/admin/fabrics/gloss/:id',
        name: 'Chi tiết độ bóng',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_GLOSS.key,
      },
      GLOSS_EDIT: {
        path: '/admin/fabrics/gloss/:id/edit',
        name: 'Chỉnh sửa độ bóng',
        requiredPermission: PERMISSIONS.FABRICS.MANAGE_GLOSS.key,
      },
    },

    // Fabric Count (YOLO Detection)
    FABRIC_COUNT: {
      LIST: {
        path: '/admin/fabric-count',
        name: 'Đếm vải',
        description: 'Phát hiện và đếm vải từ hình ảnh',
      },
    },

    // YOLO Dataset Labeling
    YOLO_DATASET_LABELING: {
      LIST: {
        path: '/admin/yolo-dataset-labeling',
        name: 'Gán nhãn dataset YOLO',
        description: 'Tạo label cho ảnh để train YOLO model',
      },
    },

    // YOLO Dataset Management
    YOLO_DATASETS: {
      LIST: {
        path: '/admin/yolo-datasets',
        name: 'Quản lý Dataset YOLO',
        description: 'Quản lý các dataset YOLO để huấn luyện mô hình',
        requiredPermission: PERMISSIONS.YOLO.VIEW_DATASET.key,
      },
      DETAIL: {
        path: '/admin/yolo-datasets/:id',
        name: 'Chi tiết Dataset YOLO',
        requiredPermission: PERMISSIONS.YOLO.VIEW_DATASET.key,
      },
      CREATE: {
        path: '/admin/yolo-datasets/create',
        name: 'Tạo Dataset YOLO',
        requiredPermission: PERMISSIONS.YOLO.MANAGE_DATASET.key,
      },
      EDIT: {
        path: '/admin/yolo-datasets/:id/edit',
        name: 'Chỉnh sửa Dataset YOLO',
        requiredPermission: PERMISSIONS.YOLO.MANAGE_DATASET.key,
      },
    },

    // YOLO Model Management
    YOLO_MODELS: {
      LIST: {
        path: '/admin/yolo-models',
        name: 'Quản lý Model YOLO',
        description: 'Quản lý các mô hình YOLO',
        requiredPermission: PERMISSIONS.YOLO.VIEW_MODELS.key,
      },
      DETAIL: {
        path: '/admin/yolo-models/:id',
        name: 'Chi tiết Model YOLO',
        requiredPermission: PERMISSIONS.YOLO.VIEW_MODEL.key,
      },
    },

    // Warehouse Management
    WAREHOUSES: {
      LIST: {
        path: '/admin/warehouses',
        name: 'Quản lý kho',
        description: 'Danh sách kho',
        requiredPermission: PERMISSIONS.WAREHOUSES.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/warehouses/:id',
        name: 'Chi tiết kho',
        requiredPermission: PERMISSIONS.WAREHOUSES.VIEW_DETAIL.key,
      },
      CREATE: {
        path: '/admin/warehouses/create',
        name: 'Tạo kho mới',
        requiredPermission: PERMISSIONS.WAREHOUSES.CREATE.key,
      },
      EDIT: {
        path: '/admin/warehouses/:id/edit',
        name: 'Chỉnh sửa kho',
        requiredPermission: PERMISSIONS.WAREHOUSES.UPDATE.key,
      },
      SHELVES: {
        path: '/admin/warehouses/:id/shelves',
        name: 'Danh sách kệ',
        requiredPermission: PERMISSIONS.SHELVES.VIEW_LIST.key,
      },
      IMPORT_FABRICS: {
        path: '/admin/warehouses/:id/import-fabrics',
        name: 'Danh sách phiếu nhập',
        requiredPermission: PERMISSIONS.IMPORT_FABRICS.VIEW_LIST.key,
      },
      IMPORT_FABRICS_CREATE: {
        path: '/admin/warehouses/:id/create-import-fabric',
        name: 'Tạo phiếu nhập',
        requiredPermission: PERMISSIONS.IMPORT_FABRICS.CREATE.key,
      },
      IMPORT_FABRICS_DETAIL: {
        path: '/admin/warehouses/:id/import-fabrics/:importId',
        name: 'Chi tiết phiếu nhập',
        requiredPermission: PERMISSIONS.IMPORT_FABRICS.VIEW_DETAIL.key,
      },
    },

    // Shelf Management
    SHELVES: {
      LIST: {
        path: '/admin/shelves',
        name: 'Quản lý kệ',
        description: 'Danh sách kệ',
        requiredPermission: PERMISSIONS.SHELVES.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/warehouses/:id/shelves/:shelfId',
        name: 'Chi tiết kệ',
        requiredPermission: PERMISSIONS.SHELVES.VIEW_DETAIL.key,
      },
      CREATE: {
        path: '/admin/shelves/create',
        name: 'Tạo kệ mới',
        requiredPermission: PERMISSIONS.SHELVES.CREATE.key,
      },
      EDIT: {
        path: '/admin/warehouses/:id/shelves/:shelfId/edit',
        name: 'Chỉnh sửa kệ',
        requiredPermission: PERMISSIONS.SHELVES.UPDATE.key,
      },
    },

    // Credit Management
    CREDITS: {
      LIST: {
        path: '/admin/credits',
        name: 'Đăng ký tín dụng',
        description: 'Danh sách đăng ký tín dụng',
        anyPermissions: [
          PERMISSIONS.CREDITS.VIEW_LIST.key,
          PERMISSIONS.CREDITS.VIEW_OWN.key
        ],
      },
      DETAIL: {
        path: '/admin/credits/:id',
        name: 'Chi tiết tín dụng',
        requiredPermission: PERMISSIONS.CREDITS.VIEW_DETAIL.key,
      },
      CREATE: {
        path: '/admin/credits/create',
        name: 'Tạo đăng ký tín dụng',
        requiredPermission: PERMISSIONS.CREDITS.CREATE.key,
      },
      APPROVE: {
        path: '/admin/credits/:id/approve',
        name: 'Phê duyệt tín dụng',
        requiredPermission: PERMISSIONS.CREDITS.APPROVE.key,
      },
    },

    // Role Management
    ROLES: {
      LIST: {
        path: '/admin/roles',
        name: 'Quản lý vai trò',
        requiredPermission: PERMISSIONS.ROLES.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/roles/:name',
        name: 'Chi tiết vai trò',
        requiredPermission: PERMISSIONS.ROLES.VIEW_DETAIL.key,
      },
      CREATE: {
        path: '/admin/roles/create',
        name: 'Tạo vai trò',
        requiredPermission: PERMISSIONS.ROLES.CREATE.key,
      },
      EDIT: {
        path: '/admin/roles/:name/edit',
        name: 'Chỉnh sửa vai trò',
        requiredPermission: PERMISSIONS.ROLES.UPDATE.key,
      },
    },

    // Invoice Management
    INVOICES: {
      LIST: {
        path: '/admin/invoices',
        name: 'Quản lý hóa đơn',
        requiredPermission: PERMISSIONS.INVOICES.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/invoices/:id',
        name: 'Chi tiết hóa đơn',
        requiredPermission: PERMISSIONS.INVOICES.VIEW_DETAIL.key,
      },
    },

    // Export Fabric Management
    EXPORT_FABRICS: {
      LIST: {
        path: '/admin/export-fabrics',
        name: 'Yêu cầu xuất kho',
        requiredPermission: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key,
      },
      DETAIL: {
        path: '/admin/export-fabrics/:id',
        name: 'Chi tiết xuất kho',
        requiredPermission: PERMISSIONS.EXPORT_FABRICS.VIEW_DETAIL.key,
      },
    },

    // System Administration
    SYSTEM: {
      AUDIT_LOGS: {
        path: '/admin/system/audit-logs',
        name: 'Nhật ký hệ thống',
        requiredPermission: PERMISSIONS.SYSTEM.VIEW_AUDIT_LOGS.key,
      },
      PERMISSIONS: {
        path: '/admin/system/permissions',
        name: 'Quản lý quyền',
        requiredPermission: PERMISSIONS.SYSTEM.MANAGE_PERMISSIONS.key,
      },
      CONFIG: {
        path: '/admin/system/config',
        name: 'Cấu hình hệ thống',
        requiredPermission: PERMISSIONS.SYSTEM.SYSTEM_CONFIG.key,
      },
    },

  },

  // Profile (chung cho tất cả người dùng)
  PROFILE: {
    VIEW: {
      path: '/auth/profile',
      name: 'Hồ sơ cá nhân',
      requiredPermission: PERMISSIONS.USERS.VIEW_OWN_PROFILE.key,
    },
    EDIT: {
      path: '/auth/profile/edit',
      name: 'Chỉnh sửa hồ sơ',
      requiredPermission: PERMISSIONS.USERS.UPDATE_OWN_PROFILE.key,
    },
  },
} as const;

/**
 * Helper để lấy tất cả routes dưới dạng flat array
 */
export const getAllRoutes = (): RouteConfig[] => {
  const routes: RouteConfig[] = [];
  
  const extractRoutes = (obj: any) => {
    for (const value of Object.values(obj)) {
      if (value && typeof value === 'object') {
        if ('path' in value && 'name' in value) {
          routes.push(value as RouteConfig);
        } else {
          extractRoutes(value);
        }
      }
    }
  };
  
  extractRoutes(ROUTES);
  return routes;
};

/**
 * Helper để tìm route config theo path
 */
export const findRouteByPath = (path: string): RouteConfig | undefined => {
  const allRoutes = getAllRoutes();
  
  // Exact match first
  const exactMatch = allRoutes.find(r => r.path === path);
  if (exactMatch) return exactMatch;
  
  // Pattern match (e.g., /admin/users/:id)
  return allRoutes.find(r => {
    const pattern = r.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
};
