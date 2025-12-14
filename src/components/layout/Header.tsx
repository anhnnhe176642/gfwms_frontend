'use client';

import React from 'react';
import { LogOut, User, Settings, LayoutDashboard, CreditCard, ShoppingCart, Briefcase, Package } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useCartStore } from '@/store/useCartStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/config/routes';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const totalItems = useCartStore((state) => state.getTotalItems());

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            GFWMS
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {isAuthenticated && user ? (
            <>
              {/* Cart Button */}
              <Button asChild variant="outline" size="sm" className="relative">
                <Link href="/shop/cart">
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>

              {user?.permissionKeys?.includes('system:admin') && (
                <Button asChild variant="default" size="sm">
                  <Link href={ROUTES.ADMIN.DASHBOARD.path} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 h-auto py-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user.username || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Tài khoản của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.PROFILE.VIEW.path} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Đơn hàng của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/credit-request" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Đăng ký hạn mức
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/auth/login">
                Đăng nhập
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
