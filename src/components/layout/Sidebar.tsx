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
  ShieldCheck
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/config/routes';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) return null;

  const menuItems = [
    {
      label: 'Dashboard',
      href: ROUTES.ADMIN.DASHBOARD.path,
      icon: LayoutDashboard,
      requiredPermission: null,
    },
    {
      label: 'Quản lý người dùng',
      href: ROUTES.ADMIN.USERS.LIST.path,
      icon: Users,
      requiredPermission: PERMISSIONS.USERS.VIEW_LIST.key,
    },
    {
      label: 'Quản lý vải',
      href: ROUTES.ADMIN.FABRICS.LIST.path,
      icon: Package,
      requiredPermission: PERMISSIONS.FABRICS.VIEW_LIST.key,
    },
    {
      label: 'Quản lý kho',
      href: ROUTES.ADMIN.WAREHOUSES.LIST.path,
      icon: Warehouse,
      requiredPermission: PERMISSIONS.WAREHOUSES.VIEW_LIST.key,
    },
    {
      label: 'Đăng ký tín dụng',
      href: ROUTES.ADMIN.CREDITS.LIST.path,
      icon: CreditCard,
      requiredPermission: PERMISSIONS.CREDITS.VIEW_LIST.key,
    },
    {
      label: 'Hóa đơn',
      href: ROUTES.ADMIN.INVOICES.LIST.path,
      icon: FileText,
      requiredPermission: PERMISSIONS.INVOICES.VIEW_LIST.key,
    },
    {
      label: 'Xuất kho',
      href: ROUTES.ADMIN.EXPORT_FABRICS.LIST.path,
      icon: TruckIcon,
      requiredPermission: PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key,
    },
    {
      label: 'Quản lý vai trò',
      href: ROUTES.ADMIN.ROLES.LIST.path,
      icon: ShieldCheck,
      requiredPermission: PERMISSIONS.ROLES.VIEW.key,
    },
    {
      label: 'Cài đặt',
      href: ROUTES.ADMIN.SYSTEM.CONFIG.path,
      icon: Settings,
      requiredPermission: PERMISSIONS.SYSTEM.SYSTEM_CONFIG.key,
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  const isActive = (href: string) => pathname === href;

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
        <nav className="flex flex-col h-full p-4 space-y-2">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })
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
