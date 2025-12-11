'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Settings, 
  Users,
  Package,
  Warehouse,
  CreditCard,
  FileText,
  TruckIcon,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Eye,
  Tag,
  ShoppingCart
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/config/routes';
import { warehouseService } from '@/services/warehouse.service';
import { storeService } from '@/services/store.service';
import { extractIdFromPath } from '@/lib/extractIdFromPath';

type MenuItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  requiredPermission?: string | null;
  submenu?: MenuItem[];
  dynamicSubmenu?: (id: string) => MenuItem[];
};

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [warehouseName, setWarehouseName] = useState<string | null>(null);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) return null;

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: ROUTES.ADMIN.DASHBOARD.path,
      icon: LayoutDashboard,
      requiredPermission: null,
    },
    {
      label: 'Quản lý người dùng',
      icon: Users,
      requiredPermission: null,
      submenu: [
        {
          label: 'Danh sách người dùng',
          href: ROUTES.ADMIN.USERS.LIST.path,
          icon: Users,
          requiredPermission: PERMISSIONS.USERS.VIEW_LIST.key,
        },
        {
          label: 'Quản lý vai trò',
          href: ROUTES.ADMIN.ROLES.LIST.path,
          icon: ShieldCheck,
          requiredPermission: PERMISSIONS.ROLES.VIEW_LIST.key,
        },
      ],
    },
    {
      label: 'Quản lý vải',
      icon: Package,
      requiredPermission: null,
      submenu: [
        {
          label: 'Danh sách vải',
          href: ROUTES.ADMIN.FABRICS.LIST.path,
          icon: Package,
          requiredPermission: PERMISSIONS.FABRICS.VIEW_LIST.key,
        },
        {
          label: 'Loại vải',
          href: ROUTES.ADMIN.FABRICS.CATEGORIES.path,
          icon: Package,
          requiredPermission: PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key,
        },
        {
          label: 'Màu vải',
          href: ROUTES.ADMIN.FABRICS.COLORS.path,
          icon: Package,
          requiredPermission: PERMISSIONS.FABRICS.MANAGE_COLORS.key,
        },
        {
          label: 'Độ bóng',
          href: ROUTES.ADMIN.FABRICS.GLOSS.path,
          icon: Package,
          requiredPermission: PERMISSIONS.FABRICS.MANAGE_GLOSS.key,
        },
        {
          label: 'Nhà cung cấp',
          href: ROUTES.ADMIN.FABRICS.SUPPLIERS.path,
          icon: Package,
          requiredPermission: PERMISSIONS.FABRICS.MANAGE_SUPPLIER.key,
        },
        {
          label: 'Đếm vải',
          href: ROUTES.ADMIN.FABRIC_COUNT.LIST.path,
          icon: Eye,
          requiredPermission: PERMISSIONS.YOLO.DETECT.key,
        },
      ],
    },
    {
      label: 'Quản lý YOLO',
      icon: Tag,
      submenu: [
        {
          label: 'Dataset YOLO',
          href: ROUTES.ADMIN.YOLO_DATASETS.LIST.path,
          icon: Tag,
          requiredPermission: PERMISSIONS.YOLO.VIEW_DATASET.key,
        },
        {
          label: 'Model YOLO',
          href: ROUTES.ADMIN.YOLO_MODELS.LIST.path,
          icon: Package,
          requiredPermission: PERMISSIONS.YOLO.VIEW_MODELS.key,
        },
      ],
    },
    {
      label: 'Quản lý kho',
      icon: Warehouse,
      requiredPermission: PERMISSIONS.WAREHOUSES.VIEW_LIST.key,
      href: ROUTES.ADMIN.WAREHOUSES.LIST.path,
      dynamicSubmenu: (id: string) => [
        {
          label: 'Chi tiết kho',
          href: `/admin/warehouses/${id}`,
          icon: Warehouse,
          requiredPermission: PERMISSIONS.WAREHOUSES.VIEW_DETAIL.key,
        },
        {
          label: 'Nhập kho',
          href: `/admin/warehouses/${id}/import-fabrics`,
          icon: Package,
          requiredPermission: PERMISSIONS.IMPORT_FABRICS.VIEW_LIST.key,
        },
        {
          label: 'Xuất kho',
          href: `/admin/warehouses/${id}/export-fabrics`,
          icon: TruckIcon,
          requiredPermission: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key,
        },
        {
          label: 'Quản lý kệ',
          href: `/admin/warehouses/${id}/shelves`,
          icon: Package,
          requiredPermission: PERMISSIONS.SHELVES.VIEW_LIST.key,
        },
      ],
      submenu: [
        {
          label: 'Lịch sử điều chỉnh vải',
          href: ROUTES.ADMIN.WAREHOUSES.ADJUST_FABRIC_HISTORY.path,
          icon: FileText,
          requiredPermission: PERMISSIONS.SHELVES.ADJUST_FABRIC.key,
        },
      ],
    },
    {
      label: 'Quản lý cửa hàng',
      icon: Package,
      requiredPermission: PERMISSIONS.STORES.VIEW_LIST.key,
      href: ROUTES.ADMIN.STORES.LIST.path,
      dynamicSubmenu: (id: string) => [
        {
          label: 'Chi tiết cửa hàng',
          href: `/admin/stores/${id}`,
          icon: Package,
          requiredPermission: PERMISSIONS.STORES.VIEW_DETAIL.key,
        },
        {
          label: 'Danh sách vải',
          href: `/admin/stores/${id}/fabrics`,
          icon: Package,
          requiredPermission: PERMISSIONS.STORES.VIEW_DETAIL.key,
        },
        {
          label: 'Yêu cầu xuất kho',
          href: `/admin/stores/${id}/export-requests`,
          icon: TruckIcon,
          requiredPermission: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key,
        },
      ],
    },
    {
      label: 'Quản lí tín dụng',
      icon: CreditCard,
      requiredPermission: null,
      submenu: [
        {
          label: 'Đăng ký tín dụng',
          href: ROUTES.ADMIN.CREDITS.LIST.path,
          icon: CreditCard,
          requiredPermission: PERMISSIONS.CREADIT_REGISTRATION.VIEW_LIST.key,
        },
        {
          label: 'Đơn hạn mức',
          href: ROUTES.ADMIN.CREDIT_REQUESTS.LIST.path,
          icon: CreditCard,
          requiredPermission: PERMISSIONS.CREADIT_REQUEST.VIEW_LIST.key,
        },
      ],
    },
    {
      label: 'Hóa đơn',
      href: ROUTES.ADMIN.INVOICES.LIST.path,
      icon: FileText,
      requiredPermission: PERMISSIONS.INVOICES.VIEW_LIST.key,
    },
    {
      label: 'Đơn hàng',
      href: ROUTES.ADMIN.ORDERS.LIST.path,
      icon: ShoppingCart,
      requiredPermission: PERMISSIONS.ORDERS.VIEW_LIST.key,
    },
    {
      label: 'Xuất kho',
      href: ROUTES.ADMIN.EXPORT_FABRICS.LIST.path,
      icon: TruckIcon,
      requiredPermission: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key,
    },
    {
      label: 'Cài đặt',
      href: ROUTES.ADMIN.SYSTEM.CONFIG.path,
      icon: Settings,
      requiredPermission: PERMISSIONS.SYSTEM.SYSTEM_CONFIG.key,
    },
  ];

  // Extract ID from URL params (e.g., /admin/warehouses/123 -> 123)
  const warehouseId = extractIdFromPath(pathname, '/admin/warehouses/:id');
  const storeId = extractIdFromPath(pathname, '/admin/stores/:id');

  // Fetch warehouse name when ID changes
  React.useEffect(() => {
    if (warehouseId && !isNaN(Number(warehouseId))) {
      setLoadingWarehouse(true);
      warehouseService
        .getWarehouseById(warehouseId)
        .then((warehouse) => {
          setWarehouseName(warehouse.name);
        })
        .catch(() => {
          setWarehouseName(null);
        })
        .finally(() => {
          setLoadingWarehouse(false);
        });
    } else {
      setWarehouseName(null);
    }
  }, [warehouseId]);

  // Fetch store name when ID changes
  React.useEffect(() => {
    if (storeId && !isNaN(Number(storeId))) {
      setLoadingStore(true);
      storeService
        .getStoreById(storeId)
        .then((store) => {
          setStoreName(store.name);
        })
        .catch(() => {
          setStoreName(null);
        })
        .finally(() => {
          setLoadingStore(false);
        });
    } else {
      setStoreName(null);
    }
  }, [storeId]);

  // Generate all menu items with dynamic submenu
  const getMenuItemsWithDynamic = (items: MenuItem[]): MenuItem[] => {
    return items.map((item) => {
      if (item.dynamicSubmenu) {
        let id: string | null = null;
        if (item.label === 'Quản lý kho') {
          id = warehouseId;
        } else if (item.label === 'Quản lý cửa hàng') {
          id = storeId;
        }
        if (id) {
          return {
            ...item,
            submenu: item.dynamicSubmenu(id),
          };
        }
      }
      return item;
    });
  };

  const menuItemsWithDynamic = getMenuItemsWithDynamic(menuItems);

  // Auto-expand parent menus when a submenu item is active
  React.useEffect(() => {
    const findParentMenus = (items: MenuItem[], targetPath: string, parents: string[] = []): string[] => {
      for (const item of items) {
        if (item.href === targetPath) {
          return parents;
        }
        if (item.submenu && item.submenu.length > 0) {
          const result = findParentMenus(item.submenu, targetPath, [...parents, item.label]);
          if (result.length > 0) {
            return result;
          }
        }
      }
      return [];
    };

    const parentMenus = findParentMenus(menuItemsWithDynamic, pathname);
    if (parentMenus.length > 0) {
      setExpandedMenus(parentMenus);
    }
  }, [pathname, warehouseId]);

  const isActive = (href?: string) => href && pathname === href;

  const isMenuExpanded = (label: string) => expandedMenus.includes(label);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission))
      .map((item) => {
        let submenu = item.submenu ? filterMenuItems(item.submenu) : undefined;

        return {
          ...item,
          submenu,
        };
      })
      .filter((item) => item.submenu ? item.submenu.length > 0 : true);
  };

  const visibleItems = filterMenuItems(menuItemsWithDynamic);

  const renderMenuItem = (item: MenuItem, level: number = 0): React.ReactNode => {
    const Icon = item.icon;
    const expanded = isMenuExpanded(item.label);
    const active = isActive(item.href);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenu = level > 0;
    const textSize = isSubmenu ? 'text-sm' : 'text-base';
    const isWarehouseMenu = item.label === 'Quản lý kho' && item.dynamicSubmenu;
    const isStoreMenu = item.label === 'Quản lý cửa hàng' && item.dynamicSubmenu;

    return (
      <div key={item.label}>
        {item.href ? (
          <Link
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${textSize} ${
              active
                ? 'bg-primary text-primary-foreground font-semibold'
                : isSubmenu
                  ? 'text-foreground hover:bg-muted/60'
                  : 'text-foreground hover:bg-accent'
            } ${isSubmenu ? 'border-l-2 border-muted-foreground/30 bg-muted/20' : ''}`}
            style={{ marginLeft: `${level * 8}px` }}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
          </Link>
        ) : (
          <button
            onClick={() => toggleMenu(item.label)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${textSize} text-foreground hover:bg-accent ${
              isSubmenu ? 'border-l-2 border-muted-foreground/30 bg-muted/20' : ''
            }`}
            style={{ marginLeft: `${level * 8}px` }}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {hasSubmenu && (
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
        )}

        {hasSubmenu && expanded && (
          <div className="space-y-1 mt-1 border-l-2 border-muted-foreground/20 ml-3 pl-2">
            {isWarehouseMenu && warehouseId && (
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/10 rounded mb-2">
                {loadingWarehouse ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : warehouseName ? (
                  <div className="truncate" title={warehouseName}>
                     {warehouseName}
                  </div>
                ) : (
                  <span>Kho #{warehouseId}</span>
                )}
              </div>
            )}
            {isStoreMenu && storeId && (
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/10 rounded mb-2">
                {loadingStore ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : storeName ? (
                  <div className="truncate" title={storeName}>
                     {storeName}
                  </div>
                ) : (
                  <span>Cửa hàng #{storeId}</span>
                )}
              </div>
            )}
            {item.submenu!.map((subitem) => renderMenuItem(subitem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-40 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r bg-background transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:h-auto lg:translate-x-0 z-30`}
      >
        <nav className="flex flex-col h-full p-4 space-y-2 overflow-y-auto">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => renderMenuItem(item))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Không có menu khả dụng</p>
            </div>
          )}

          {visibleItems.length > 0 && <div className="border-t my-4" />}

          <div className="mt-auto pt-4 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-4">TRỢ GIÚP</p>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              Tài liệu
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
