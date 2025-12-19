'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  Calendar,
  Store,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardData, DashboardParams } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#facc15',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#22c55e',
  CANCELED: '#ef4444',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
};

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
];

const revenueChartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: '#3b82f6',
  },
  profit: {
    label: 'Lợi nhuận',
    color: '#10b981',
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

const orderStatusChartConfig = {
  count: {
    label: 'Số đơn',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<DashboardParams>({
    startDate: format(subDays(new Date(), 365), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    period: 'month',
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getFullDashboard(params);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    fetchDashboard();
  };

  const handleParamChange = (key: keyof DashboardParams, value: string | number | undefined) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  // Format period data for chart
  const formatRevenueData = () => {
    if (!data?.revenue.byPeriod) return [];
    return data.revenue.byPeriod.map((item) => ({
      ...item,
      periodLabel: formatPeriodLabel(item.period, params.period),
    }));
  };

  const formatPeriodLabel = (period: string, periodType?: string) => {
    try {
      const date = new Date(period);
      if (periodType === 'year') {
        return format(date, 'yyyy');
      } else if (periodType === 'month') {
        return format(date, 'MM/yyyy');
      }
      return format(date, 'dd/MM');
    } catch {
      return period;
    }
  };

  // Format category data for pie chart
  const formatCategoryData = () => {
    if (!data?.revenue.byCategory) return [];
    return data.revenue.byCategory.map((item, index) => ({
      ...item,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  };

  // Format order status data
  const formatOrderStatusData = () => {
    if (!data?.orders.ordersByStatus) return [];
    return data.orders.ordersByStatus.map((item) => ({
      ...item,
      statusLabel: ORDER_STATUS_LABELS[item.status] || item.status,
      fill: ORDER_STATUS_COLORS[item.status] || '#6b7280',
    }));
  };

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Tổng quan hệ thống quản lý vải</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={params.startDate || ''}
                  onChange={(e) => handleParamChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={params.endDate || ''}
                  onChange={(e) => handleParamChange('endDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kỳ thống kê</Label>
                <Select
                  value={params.period || 'day'}
                  onValueChange={(value) => handleParamChange('period', value as 'day' | 'month' | 'year')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Theo ngày</SelectItem>
                    <SelectItem value="month">Theo tháng</SelectItem>
                    <SelectItem value="year">Theo năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cửa hàng</Label>
                <Select
                  value={params.storeId?.toString() || 'all'}
                  onValueChange={(value) =>
                    handleParamChange('storeId', value === 'all' ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả cửa hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                    {data?.revenue.byStore?.map((store) => (
                      <SelectItem key={store.storeId} value={store.storeId.toString()}>
                        {store.storeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lợi nhuận: {formatCurrency(data.overview.grossProfit)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                  <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(data.overview.totalOrders)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hoàn thành: {formatNumber(data.overview.completedOrders)} đơn
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                  <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(data.overview.totalCustomers)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Giá trị TB: {formatCurrency(data.overview.averageOrderValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cảnh báo tồn kho</CardTitle>
                  <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{formatNumber(data.overview.lowStockAlerts)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sản phẩm cần nhập thêm</p>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Biên lợi nhuận</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.overview.profitMargin}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cuộn đã bán</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(data.overview.totalRollsSold)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mét đã bán</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(data.overview.totalMetersSold)} m</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cửa hàng</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(data.revenue.byStore?.length || 0)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo thời gian</CardTitle>
                  <CardDescription>Biểu đồ doanh thu và lợi nhuận</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                    <AreaChart data={formatRevenueData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="periodLabel"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => [
                              formatCurrency(value as number),
                              name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận',
                            ]}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="profit"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo danh mục</CardTitle>
                  <CardDescription>Phân bổ doanh thu theo loại vải</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                    <PieChart>
                      <Pie
                        data={formatCategoryData()}
                        dataKey="revenue"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ categoryName, percent }) =>
                          `${categoryName}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {formatCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatCurrency(value as number)}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Orders by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Đơn hàng theo trạng thái</CardTitle>
                  <CardDescription>Phân bổ đơn hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={orderStatusChartConfig} className="h-[300px] w-full">
                    <BarChart data={formatOrderStatusData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="statusLabel" type="category" width={100} tick={{ fontSize: 12 }} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name, props) => [
                              `${value} đơn (${formatCurrency(props.payload.totalAmount)})`,
                              'Số đơn',
                            ]}
                          />
                        }
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {formatOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Category Revenue Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>So sánh doanh thu danh mục</CardTitle>
                  <CardDescription>Doanh thu và số lượng theo loại vải</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                    <BarChart data={formatCategoryData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatCurrency(value as number)}
                          />
                        }
                      />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {formatCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top khách hàng</CardTitle>
                  <CardDescription>Khách hàng có doanh số cao nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {data.customers.topCustomers?.slice(0, 10).map((customer, index) => (
                      <div
                        key={customer.userId}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{customer.fullname}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(customer.totalSpent)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {customer.orderCount} đơn
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Cảnh báo tồn kho
                  </CardTitle>
                  <CardDescription>Sản phẩm cần nhập thêm hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {data.inventory.lowStockAlerts?.slice(0, 15).map((alert) => (
                      <div
                        key={alert.fabricId}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2"
                          style={{ backgroundColor: alert.hexCode }}
                          title={alert.colorName}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{alert.categoryName}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {alert.colorName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {alert.totalUncutRolls} cuộn / {alert.totalMeters}m
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              alert.status === 'OUT_OF_STOCK'
                                ? 'text-red-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {alert.status === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Tồn thấp'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Store Revenue */}
            {data.revenue.byStore && data.revenue.byStore.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Doanh thu theo cửa hàng</CardTitle>
                  <CardDescription>Thống kê doanh thu từng cửa hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.revenue.byStore.map((store) => (
                      <div
                        key={store.storeId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                            <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium">{store.storeName}</div>
                            <div className="text-sm text-muted-foreground">{store.storeAddress}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-green-600">
                            {formatCurrency(store.revenue)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {store.orderCount} đơn | {store.rollsSold} cuộn | {store.metersSold}m
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Purchase Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Phân tích khách hàng</CardTitle>
                <CardDescription>Tần suất mua hàng của khách hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {data.customers.purchaseFrequency?.frequencyDistribution?.oneTime || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Mua 1 lần</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {data.customers.purchaseFrequency?.frequencyDistribution?.occasional || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Thỉnh thoảng</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {data.customers.purchaseFrequency?.frequencyDistribution?.regular || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Thường xuyên</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {data.customers.purchaseFrequency?.frequencyDistribution?.loyal || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Trung thành</div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Trung bình {data.customers.purchaseFrequency?.averageDaysBetweenOrders || 0} ngày giữa
                  các đơn hàng
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p>Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
