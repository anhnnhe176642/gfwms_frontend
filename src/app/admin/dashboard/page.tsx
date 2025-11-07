'use client';

import React from 'react';
import { BarChart3, Users, TrendingUp, Package, Warehouse, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockStatsData = [
  {
    id: 1,
    title: 'Tổng Fabric',
    value: '1,234',
    change: '+20%',
    description: 'so với tháng trước',
    icon: Package,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 2,
    title: 'Tổng Người Dùng',
    value: '45',
    change: '+5%',
    description: 'so với tháng trước',
    icon: Users,
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 3,
    title: 'Kho Hàng',
    value: '12',
    change: '+2%',
    description: 'so với tháng trước',
    icon: Warehouse,
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 4,
    title: 'Tồn Kho Cảnh Báo',
    value: '8',
    change: '-10%',
    description: 'cần xử lý',
    icon: AlertCircle,
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
];

const mockRecentFabrics = [
  {
    id: 1,
    name: 'Cotton Linen',
    category: 'Vải Cotton',
    quantity: '500m',
    warehouse: 'Kho 1',
    status: 'active',
  },
  {
    id: 2,
    name: 'Silk Blend',
    category: 'Vải Lụa',
    quantity: '300m',
    warehouse: 'Kho 2',
    status: 'active',
  },
  {
    id: 3,
    name: 'Polyester Stretch',
    category: 'Vải Polyester',
    quantity: '150m',
    warehouse: 'Kho 1',
    status: 'warning',
  },
  {
    id: 4,
    name: 'Wool Blend',
    category: 'Vải Lông',
    quantity: '80m',
    warehouse: 'Kho 3',
    status: 'low',
  },
  {
    id: 5,
    name: 'Denim',
    category: 'Vải Denim',
    quantity: '600m',
    warehouse: 'Kho 2',
    status: 'active',
  },
];

const mockRecentUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'Admin',
    joinDate: '2025-01-15',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'Manager',
    joinDate: '2025-02-10',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'Staff',
    joinDate: '2025-03-05',
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    role: 'Staff',
    joinDate: '2025-03-20',
  },
];

const FABRIC_STATUS_CONFIG = {
  active: { value: 'active', label: 'Hoạt động', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  warning: { value: 'warning', label: 'Cảnh báo', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  low: { value: 'low', label: 'Thấp', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
} as const;

const USER_ROLE_CONFIG = {
  Admin: { value: 'Admin', label: 'Admin', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  Manager: { value: 'Manager', label: 'Manager', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  Staff: { value: 'Staff', label: 'Staff', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
} as const;

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống quản lý vải</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStatsData.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <IconComponent className={`h-4 w-4 ${stat.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 dark:text-green-400">{stat.change}</span> {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Fabrics */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Vải Mới Nhất</CardTitle>
                <CardDescription>5 vải được thêm gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentFabrics.map((fabric) => (
                    <div key={fabric.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{fabric.name}</div>
                        <div className="text-xs text-muted-foreground">{fabric.category}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{fabric.quantity}</div>
                        <div className="text-xs text-muted-foreground">{fabric.warehouse}</div>
                      </div>
                      <div className="ml-4">
                        <Badge value={fabric.status as keyof typeof FABRIC_STATUS_CONFIG} config={FABRIC_STATUS_CONFIG} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Users */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Người Dùng Mới</CardTitle>
                <CardDescription>4 người dùng gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <Badge value={user.role as keyof typeof USER_ROLE_CONFIG} config={USER_ROLE_CONFIG} className="text-xs" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
