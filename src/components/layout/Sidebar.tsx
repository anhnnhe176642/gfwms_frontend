'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Settings } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) return null;

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      requiredPermission: 'system:config',
    },
    {
      label: 'Cài đặt',
      href: '/admin/settings',
      icon: Settings,
      requiredPermission: 'system:config',
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-40 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r bg-background transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:translate-x-0 z-30`}
      >
        <nav className="flex flex-col h-full p-4 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => {
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
          })}

          {/* Divider */}
          {visibleItems.length > 0 && <div className="border-t my-4" />}

          {/* Help Section */}
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

      {/* Mobile Overlay */}
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
