'use client';

import { UserStatsData } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatters } from '@/lib/formatters';
import {
  Package,
  Upload,
  Download,
  CreditCard,
  Wallet,
  Store,
  Warehouse,
  TrendingUp,
} from 'lucide-react';

interface UserStatsOverviewProps {
  stats: UserStatsData;
  isLoading?: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color = 'blue',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}) => (
  <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
      <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    </div>
  </div>
);

export function UserStatsOverview({ stats, isLoading }: UserStatsOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê người dùng</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const creditInfo = stats.creditInfo;
  const creditPercentage = creditInfo
    ? Math.round((creditInfo.creditUsed / creditInfo.creditLimit) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Thống kê đơn hàng
          </CardTitle>
          <CardDescription>Phân tích đơn hàng theo vai trò</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Orders */}
            <div className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Đơn hàng (Khách)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng đơn:</span>
                  <span className="font-semibold">{stats.orderStats.summary.asCustomer.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng giá trị:</span>
                  <span className="font-semibold">{formatters.formatCurrency(stats.orderStats.summary.asCustomer.totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trung bình:</span>
                  <span className="font-semibold">{formatters.formatCurrency(parseFloat(stats.orderStats.summary.asCustomer.averageOrderValue))}</span>
                </div>
              </div>
            </div>

            {/* Staff Orders */}
            <div className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Đơn hàng (Nhân viên)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạo:</span>
                  <span className="font-semibold">{stats.orderStats.summary.asStaff.totalCreated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng giá trị:</span>
                  <span className="font-semibold">{formatters.formatCurrency(stats.orderStats.summary.asStaff.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trung bình:</span>
                  <span className="font-semibold">{formatters.formatCurrency(parseFloat(stats.orderStats.summary.asStaff.averageOrderValue))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          {Object.keys(stats.orderStats.breakdown).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold mb-3">Phân loại theo trạng thái</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(stats.orderStats.breakdown).map(([status, count]) => (
                  <div key={status} className="p-2 bg-muted rounded text-center">
                    <p className="text-xs text-muted-foreground truncate">{status}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export & Import Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-5 w-5" />
              Thống kê xuất vải
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Tổng xuất</p>
              <p className="text-2xl font-bold">{stats.exportStats.summary.totalExports}</p>
            </div>

            {Object.keys(stats.exportStats.breakdown).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Trạng thái</p>
                {Object.entries(stats.exportStats.breakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-5 w-5" />
              Thống kê nhập vải
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng nhập:</span>
                <span className="font-semibold">{stats.importStats.summary.totalImports}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng chi phí:</span>
                <span className="font-semibold">{formatters.formatCurrency(stats.importStats.summary.totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trung bình:</span>
                <span className="font-semibold">{formatters.formatCurrency(parseFloat(stats.importStats.summary.averageCost))}</span>
              </div>
            </div>

            {Object.keys(stats.importStats.breakdown).length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-semibold">Trạng thái</p>
                {Object.entries(stats.importStats.breakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Thống kê thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={CreditCard}
              label="Tổng thanh toán"
              value={stats.paymentStats.summary.totalPayments}
              subValue={`${formatters.formatCurrency(stats.paymentStats.summary.totalAmount)}`}
              color="cyan"
            />
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Thành công</p>
              <p className="text-2xl font-bold text-foreground">{stats.paymentStats.summary.successfulPayments}</p>
              <p className="text-xs text-muted-foreground mt-1">Trung bình: {formatters.formatCurrency(parseFloat(stats.paymentStats.summary.averagePayment))}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Theo loại</p>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hóa đơn:</span>
                  <span className="font-semibold">{stats.paymentStats.summary.invoicePayments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tín dụng:</span>
                  <span className="font-semibold">{stats.paymentStats.summary.creditPayments}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Thông tin tín dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Hạn mức</p>
                <p className="text-2xl font-bold">{formatters.formatCurrency(creditInfo.creditLimit)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Đã dùng</p>
                <p className="text-2xl font-bold text-red-600">{formatters.formatCurrency(creditInfo.creditUsed)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Còn lại</p>
                <p className="text-2xl font-bold text-green-600">{formatters.formatCurrency(creditInfo.creditAvailable)}</p>
              </div>
            </div>

            {/* Credit Usage Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Tỉ lệ sử dụng</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {creditInfo.utilizationRate}
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    creditPercentage > 80
                      ? 'bg-red-500'
                      : creditPercentage > 50
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${creditPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{creditInfo.creditUsed.toLocaleString()}</span>
                <span>{creditInfo.creditLimit.toLocaleString()}</span>
              </div>
            </div>

            {/* Credit Status */}
            <div className="flex items-center justify-between p-3 border rounded bg-muted/50">
              <span className="text-sm font-semibold">Trạng thái tín dụng</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    creditInfo.status === 'ACTIVE'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {creditInfo.status}
                </span>
                {creditInfo.isCritical && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    ⚠️ Nguy hiểm
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Requests Summary */}
      {stats.creditRequests.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu tín dụng</CardTitle>
            <CardDescription>Tổng {stats.creditRequests.total} yêu cầu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* By Status */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Theo trạng thái</h4>
                {Object.entries(stats.creditRequests.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>

              {/* By Type */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Theo loại</h4>
                {Object.entries(stats.creditRequests.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <span className="text-muted-foreground">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Managed Stores */}
      {stats.managedStores.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Cửa hàng quản lý ({stats.managedStores.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.managedStores.details.map((store) => (
                <div
                  key={store.id}
                  className="p-4 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.address}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        store.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {store.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Đơn hàng: {store.ordersCount}</span>
                    <span>Xuất: {store.exportsCount}</span>
                    <span>Tạo: {formatters.formatDate(store.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Managed Warehouses */}
      {stats.managedWarehouses.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Kho quản lý ({stats.managedWarehouses.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.managedWarehouses.details.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className="p-4 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{warehouse.name}</p>
                      <p className="text-xs text-muted-foreground">{warehouse.address}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {warehouse.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Kệ: {warehouse.shelvesCount}</span>
                    <span>Nhập: {warehouse.importsCount}</span>
                    <span>Tạo: {formatters.formatDate(warehouse.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
