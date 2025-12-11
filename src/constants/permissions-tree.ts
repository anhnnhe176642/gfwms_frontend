import { PERMISSIONS } from './permissions';

/**
 * PERMISSIONS_TREE - Cấu trúc nhóm lại quyền cho màn hình chỉnh sửa quyền (Role Management UI)
 * - Được dùng RIÊNG cho PermissionTree.tsx
 * - Không tạo ra các key permission mới, chỉ gom nhóm các permission hiện tại theo tổ chức logic UI
 */
export const PERMISSIONS_TREE = {
  // ===== CUSTOMER (Level 0 - End Users) =====
  CUSTOMER: {
    groupKey: 'customer',
    groupTitle: 'Khách hàng',
    groupDescription: 'Quyền dành cho khách hàng và người dùng cuối',
    
    children: [
      {
        key: PERMISSIONS.ORDERS.CREATE_ONLINE.key,
        description: PERMISSIONS.ORDERS.CREATE_ONLINE.description,
        level: 0,
        children: [],
      },
      
      {
        key: PERMISSIONS.ORDERS.VIEW_MY.key,
        description: PERMISSIONS.ORDERS.VIEW_MY.description,
        level: 0,
        children: [],
      },
      
      {
        key: PERMISSIONS.CREADIT_REQUEST.CREATE.key,
        description: PERMISSIONS.CREADIT_REQUEST.CREATE.description,
        level: 0,
        children: [],
      },
      
      {
        key: PERMISSIONS.USERS.VIEW_OWN_PROFILE.key,
        description: PERMISSIONS.USERS.VIEW_OWN_PROFILE.description,
        level: 0,
        children: [],
      },
      
      {
        key: PERMISSIONS.USERS.UPDATE_OWN_PROFILE.key,
        description: PERMISSIONS.USERS.UPDATE_OWN_PROFILE.description,
        level: 0,
        children: [],
      },
      
      {
        key: PERMISSIONS.CREDITS.VIEW_OWN.key,
        description: PERMISSIONS.CREDITS.VIEW_OWN.description,
        level: 0,
        children: [],
      },
      
      {
        key: PERMISSIONS.CREDIT_INVOICES.VIEW_MY.key,
        description: PERMISSIONS.CREDIT_INVOICES.VIEW_MY.description,
        level: 0,
        children: [],
      },
    ],
  },

  // ===== ADMIN (Level 1+ - Management) =====
  ADMIN: {
    groupKey: 'admin',
    groupTitle: 'Quản trị',
    groupDescription: 'Quyền quản lý toàn bộ hệ thống',
    
    children: [
      // 1. Quản lí người dùng
      {
        groupKey: 'user_management',
        groupTitle: 'Quản lí người dùng',
        groupDescription: 'Quản lý người dùng, khách hàng và vai trò hệ thống',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.SYSTEM.MANAGE_ROLES.key,
            description: PERMISSIONS.SYSTEM.MANAGE_ROLES.description,
            level: 1,
            children: [],
          },
          
          {
            key: PERMISSIONS.USERS.VIEW_LIST.key,
            description: PERMISSIONS.USERS.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.USERS.VIEW_DETAIL.key,
                description: PERMISSIONS.USERS.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.USERS.CREATE.key,
                description: PERMISSIONS.USERS.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.USERS.UPDATE.key,
                description: PERMISSIONS.USERS.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.USERS.DELETE.key,
                description: PERMISSIONS.USERS.DELETE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.USERS.MANAGE_ROLES.key,
                description: PERMISSIONS.USERS.MANAGE_ROLES.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.USERS.CHANGE_STATUS.key,
                description: PERMISSIONS.USERS.CHANGE_STATUS.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.CUSTOMERS.VIEW_LIST.key,
            description: PERMISSIONS.CUSTOMERS.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.CUSTOMERS.VIEW_DETAIL.key,
                description: PERMISSIONS.CUSTOMERS.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.CUSTOMERS.UPDATE.key,
                description: PERMISSIONS.CUSTOMERS.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.CUSTOMERS.MANAGE_STATUS.key,
                description: PERMISSIONS.CUSTOMERS.MANAGE_STATUS.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.ROLES.VIEW_LIST.key,
            description: PERMISSIONS.ROLES.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.ROLES.VIEW_DETAIL.key,
                description: PERMISSIONS.ROLES.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ROLES.CREATE.key,
                description: PERMISSIONS.ROLES.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ROLES.UPDATE.key,
                description: PERMISSIONS.ROLES.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ROLES.DELETE.key,
                description: PERMISSIONS.ROLES.DELETE.description,
                level: 2,
                children: [],
              },
            ],
          },
        ],
      },

      // 2. Quản lí cửa hàng
      {
        groupKey: 'store_management',
        groupTitle: 'Quản lí cửa hàng',
        groupDescription: 'Quản lý cửa hàng, xuất kho và quyền cửa hàng',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.STORES.VIEW_LIST.key,
            description: PERMISSIONS.STORES.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.STORES.VIEW_DETAIL.key,
                description: PERMISSIONS.STORES.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.STORES.CREATE.key,
                description: PERMISSIONS.STORES.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.STORES.UPDATE.key,
                description: PERMISSIONS.STORES.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.STORES.DELETE.key,
                description: PERMISSIONS.STORES.DELETE.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.EXPORT_FABRIC_REQUESTS.VIEW_LIST.key,
            description: PERMISSIONS.EXPORT_FABRIC_REQUESTS.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.EXPORT_FABRICS.VIEW_DETAIL.key,
                description: PERMISSIONS.EXPORT_FABRICS.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.EXPORT_FABRICS.CREATE.key,
                description: PERMISSIONS.EXPORT_FABRICS.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.EXPORT_FABRICS.RECEIVE.key,
                description: PERMISSIONS.EXPORT_FABRICS.RECEIVE.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.ORDERS.CREATE_OFFLINE.key,
            description: PERMISSIONS.ORDERS.CREATE_OFFLINE.description,
            level: 1,
            children: [],
          },
          
          {
            key: null,
            description: 'Quản lí quyền cửa hàng',
            level: 1,
            isGroupNode: true,
            children: [
              {
                key: PERMISSIONS.STORES.MANAGER.key,
                description: PERMISSIONS.STORES.MANAGER.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.STORES.MANAGER_ALL.key,
                description: PERMISSIONS.STORES.MANAGER_ALL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.STORES.MANAGE_MANAGERS.key,
                description: PERMISSIONS.STORES.MANAGE_MANAGERS.description,
                level: 2,
                children: [],
              },
            ],
          },
        ],
      },

      // 3. Quản lí đơn hàng
      {
        groupKey: 'order_management',
        groupTitle: 'Quản lí đơn hàng',
        groupDescription: 'Quản lý đơn hàng, trạng thái và thanh toán',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.ORDERS.VIEW_LIST.key,
            description: PERMISSIONS.ORDERS.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.ORDERS.VIEW_DETAIL.key,
                description: PERMISSIONS.ORDERS.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ORDERS.UPDATE_STATUS.key,
                description: PERMISSIONS.ORDERS.UPDATE_STATUS.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ORDERS.CANCEL.key,
                description: PERMISSIONS.ORDERS.CANCEL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ORDERS.CONFIRM_PAYMENT.key,
                description: PERMISSIONS.ORDERS.CONFIRM_PAYMENT.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.ORDERS.CHECK_CUSTOMER_CREDIT.key,
                description: PERMISSIONS.ORDERS.CHECK_CUSTOMER_CREDIT.description,
                level: 2,
                children: [],
              },
            ],
          },
        ],
      },

      // 4. Quản lí vải
      {
        groupKey: 'fabric_management',
        groupTitle: 'Quản lí vải',
        groupDescription: 'Quản lý vải, thuộc tính vải',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.FABRICS.VIEW_LIST.key,
            description: PERMISSIONS.FABRICS.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.FABRICS.VIEW_DETAIL.key,
                description: PERMISSIONS.FABRICS.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.FABRICS.VIEW_QUANTITY.key,
                description: PERMISSIONS.FABRICS.VIEW_QUANTITY.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.FABRICS.CREATE.key,
                description: PERMISSIONS.FABRICS.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.FABRICS.UPDATE.key,
                description: PERMISSIONS.FABRICS.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.FABRICS.DELETE.key,
                description: PERMISSIONS.FABRICS.DELETE.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key,
            description: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.description,
            level: 1,
            children: [],
          },
          
          {
            key: PERMISSIONS.FABRICS.MANAGE_COLORS.key,
            description: PERMISSIONS.FABRICS.MANAGE_COLORS.description,
            level: 1,
            children: [],
          },
          
          {
            key: PERMISSIONS.FABRICS.MANAGE_GLOSS.key,
            description: PERMISSIONS.FABRICS.MANAGE_GLOSS.description,
            level: 1,
            children: [],
          },
          
          {
            key: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.key,
            description: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.description,
            level: 1,
            children: [],
          },
        ],
      },

      // 5. Quản lí kho
      {
        groupKey: 'warehouse_management',
        groupTitle: 'Quản lí kho',
        groupDescription: 'Quản lý kho, xuất kho, kệ và phiếu nhập vải',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.WAREHOUSES.VIEW_LIST.key,
            description: PERMISSIONS.WAREHOUSES.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.WAREHOUSES.VIEW_DETAIL.key,
                description: PERMISSIONS.WAREHOUSES.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.WAREHOUSES.CREATE.key,
                description: PERMISSIONS.WAREHOUSES.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.WAREHOUSES.UPDATE.key,
                description: PERMISSIONS.WAREHOUSES.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.WAREHOUSES.DELETE.key,
                description: PERMISSIONS.WAREHOUSES.DELETE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.WAREHOUSES.MANAGE_STATUS.key,
                description: PERMISSIONS.WAREHOUSES.MANAGE_STATUS.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: null,
            description: 'Quản lí xuất kho',
            level: 1,
            isGroupNode: true,
            children: [
              {
                key: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key,
                description: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.description,
                level: 2,
                children: [
                  {
                    key: PERMISSIONS.EXPORT_FABRICS.VIEW_DETAIL_WAREHOUSE.key,
                    description: PERMISSIONS.EXPORT_FABRICS.VIEW_DETAIL_WAREHOUSE.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.EXPORT_FABRICS.CHANGE_STATUS.key,
                    description: PERMISSIONS.EXPORT_FABRICS.CHANGE_STATUS.description,
                    level: 3,
                    children: [],
                  },
                ],
              },
            ],
          },
          
          {
            key: null,
            description: 'Quản lí quyền của kho',
            level: 1,
            isGroupNode: true,
            children: [
              {
                key: PERMISSIONS.WAREHOUSES.MANAGER.key,
                description: PERMISSIONS.WAREHOUSES.MANAGER.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.WAREHOUSES.MANAGER_ALL.key,
                description: PERMISSIONS.WAREHOUSES.MANAGER_ALL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.WAREHOUSES.MANAGE_MANAGERS.key,
                description: PERMISSIONS.WAREHOUSES.MANAGE_MANAGERS.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.SHELVES.VIEW_LIST.key,
            description: PERMISSIONS.SHELVES.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.SHELVES.VIEW_DETAIL.key,
                description: PERMISSIONS.SHELVES.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.SHELVES.CREATE.key,
                description: PERMISSIONS.SHELVES.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.SHELVES.UPDATE.key,
                description: PERMISSIONS.SHELVES.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.SHELVES.DELETE.key,
                description: PERMISSIONS.SHELVES.DELETE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.SHELVES.ADJUST_FABRIC.key,
                description: PERMISSIONS.SHELVES.ADJUST_FABRIC.description,
                level: 3,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.IMPORT_FABRICS.VIEW_LIST.key,
            description: PERMISSIONS.IMPORT_FABRICS.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.IMPORT_FABRICS.VIEW_DETAIL.key,
                description: PERMISSIONS.IMPORT_FABRICS.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.IMPORT_FABRICS.CREATE.key,
                description: PERMISSIONS.IMPORT_FABRICS.CREATE.description,
                level: 2,
                children: [
                  {
                    key: PERMISSIONS.IMPORT_FABRICS.SET_SELLING_PRICE.key,
                    description: PERMISSIONS.IMPORT_FABRICS.SET_SELLING_PRICE.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.FABRICS.ALLOCATE_TO_SHELF.key,
                    description: PERMISSIONS.FABRICS.ALLOCATE_TO_SHELF.description,
                    level: 3,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },

      // 6. Quản lí tín dụng
      {
        groupKey: 'credit_management',
        groupTitle: 'Quản lí tín dụng',
        groupDescription: 'Quản lý hạn mức tín dụng, đơn đăng ký, hóa đơn tín dụng',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.CREDIT_INVOICES.VIEW_LIST.key,
            description: PERMISSIONS.CREDIT_INVOICES.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.CREDIT_INVOICES.VIEW_DETAIL.key,
                description: PERMISSIONS.CREDIT_INVOICES.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.CREADIT_REGISTRATION.VIEW_LIST.key,
            description: PERMISSIONS.CREADIT_REGISTRATION.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.CREADIT_REGISTRATION.VIEW_DETAIL.key,
                description: PERMISSIONS.CREADIT_REGISTRATION.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.CREADIT_REGISTRATION.CREDIT_SCORE.key,
                description: PERMISSIONS.CREADIT_REGISTRATION.CREDIT_SCORE.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.CREADIT_REQUEST.VIEW_LIST.key,
            description: PERMISSIONS.CREADIT_REQUEST.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.CREADIT_REQUEST.VIEW_DETAIL.key,
                description: PERMISSIONS.CREADIT_REQUEST.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.CREADIT_REQUEST.APPROVE.key,
                description: PERMISSIONS.CREADIT_REQUEST.APPROVE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.CREADIT_REQUEST.REJECT.key,
                description: PERMISSIONS.CREADIT_REQUEST.REJECT.description,
                level: 2,
                children: [],
              },
            ],
          },
        ],
      },

      // 7. Quản lí hóa đơn
      {
        groupKey: 'invoice_management',
        groupTitle: 'Quản lí hóa đơn',
        groupDescription: 'Quản lý hóa đơn bán hàng',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.INVOICES.VIEW_LIST.key,
            description: PERMISSIONS.INVOICES.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.INVOICES.VIEW_DETAIL.key,
                description: PERMISSIONS.INVOICES.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
            ],
          },
        ],
      },

      // 8. Quản lí AI
      {
        groupKey: 'yolo_management',
        groupTitle: 'Quản lí AI',
        groupDescription: 'Phát hiện đối tượng trong hình ảnh (YOLO)',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.YOLO.DETECT.key,
            description: PERMISSIONS.YOLO.DETECT.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.YOLO.VIEW_MODELS.key,
                description: PERMISSIONS.YOLO.VIEW_MODELS.description,
                level: 2,
                children: [
                  {
                    key: PERMISSIONS.YOLO.VIEW_MODEL.key,
                    description: PERMISSIONS.YOLO.VIEW_MODEL.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.UPLOAD_MODEL.key,
                    description: PERMISSIONS.YOLO.UPLOAD_MODEL.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.ACTIVATE_MODEL.key,
                    description: PERMISSIONS.YOLO.ACTIVATE_MODEL.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.UPDATE_MODEL.key,
                    description: PERMISSIONS.YOLO.UPDATE_MODEL.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.DELETE_MODEL.key,
                    description: PERMISSIONS.YOLO.DELETE_MODEL.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.VIEW_LOGS.key,
                    description: PERMISSIONS.YOLO.VIEW_LOGS.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.VIEW_STATS.key,
                    description: PERMISSIONS.YOLO.VIEW_STATS.description,
                    level: 3,
                    children: [],
                  },
                ],
              },
              {
                key: PERMISSIONS.YOLO.VIEW_DATASET.key,
                description: PERMISSIONS.YOLO.VIEW_DATASET.description,
                level: 2,
                children: [
                  {
                    key: PERMISSIONS.YOLO.MANAGE_DATASET.key,
                    description: PERMISSIONS.YOLO.MANAGE_DATASET.description,
                    level: 3,
                    children: [],
                  },
                  {
                    key: PERMISSIONS.YOLO.EXPORT_DATASET.key,
                    description: PERMISSIONS.YOLO.EXPORT_DATASET.description,
                    level: 3,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },

      // 9. Quản lí banner
      {
        groupKey: 'banner_management',
        groupTitle: 'Quản lí banner',
        groupDescription: 'Quản lý banner và chiết khấu',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.BANNER.VIEW_LIST.key,
            description: PERMISSIONS.BANNER.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.BANNER.VIEW_DETAIL.key,
                description: PERMISSIONS.BANNER.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.BANNER.CREATE.key,
                description: PERMISSIONS.BANNER.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.BANNER.UPDATE.key,
                description: PERMISSIONS.BANNER.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.BANNER.DELETE.key,
                description: PERMISSIONS.BANNER.DELETE.description,
                level: 2,
                children: [],
              },
            ],
          },
          
          {
            key: PERMISSIONS.BANNER_DISCOUNT.VIEW_LIST.key,
            description: PERMISSIONS.BANNER_DISCOUNT.VIEW_LIST.description,
            level: 1,
            children: [
              {
                key: PERMISSIONS.BANNER_DISCOUNT.VIEW_DETAIL.key,
                description: PERMISSIONS.BANNER_DISCOUNT.VIEW_DETAIL.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.BANNER_DISCOUNT.CREATE.key,
                description: PERMISSIONS.BANNER_DISCOUNT.CREATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.BANNER_DISCOUNT.UPDATE.key,
                description: PERMISSIONS.BANNER_DISCOUNT.UPDATE.description,
                level: 2,
                children: [],
              },
              {
                key: PERMISSIONS.BANNER_DISCOUNT.DELETE.key,
                description: PERMISSIONS.BANNER_DISCOUNT.DELETE.description,
                level: 2,
                children: [],
              },
            ],
          },
        ],
      },

      // 10. Quản lí hệ thống
      {
        groupKey: 'system_management',
        groupTitle: 'Quản lí hệ thống',
        groupDescription: 'Cấu hình hệ thống, quản lý quyền và nhật ký',
        isGroupNode: true,
        level: 1,
        key: null,
        children: [
          {
            key: PERMISSIONS.SYSTEM.VIEW_AUDIT_LOGS.key,
            description: PERMISSIONS.SYSTEM.VIEW_AUDIT_LOGS.description,
            level: 1,
            children: [],
          },
          
          {
            key: PERMISSIONS.SYSTEM.MANAGE_PERMISSIONS.key,
            description: PERMISSIONS.SYSTEM.MANAGE_PERMISSIONS.description,
            level: 1,
            children: [],
          },
          
          {
            key: PERMISSIONS.SYSTEM.SYSTEM_CONFIG.key,
            description: PERMISSIONS.SYSTEM.SYSTEM_CONFIG.description,
            level: 1,
            children: [],
          },
        ],
      },
    ],
  },
} as const;
