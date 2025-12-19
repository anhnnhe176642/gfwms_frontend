// Dashboard API types

export interface DashboardParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  storeId?: number;
  period?: 'day' | 'month' | 'year';
}

export interface DashboardOverview {
  totalRevenue: number;
  grossProfit: number;
  profitMargin: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  totalRollsSold: number;
  totalMetersSold: number;
  totalCustomers: number;
  lowStockAlerts: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  profit: number;
  orderCount: number;
  totalRolls: number;
  totalMeters: number;
}

export interface RevenueByCategory {
  categoryId: number;
  categoryName: string;
  revenue: number;
  profit: number;
  quantity: number;
  rollsSold: number;
  metersSold: number;
}

export interface RevenueByStore {
  storeId: number;
  storeName: string;
  storeAddress: string;
  revenue: number;
  profit: number;
  orderCount: number;
  rollsSold: number;
  metersSold: number;
}

export interface DashboardRevenue {
  byPeriod: RevenueByPeriod[];
  byCategory: RevenueByCategory[];
  byStore: RevenueByStore[];
}

export interface DashboardProfit {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  orderCount: number;
}

export interface OrdersByStatus {
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  count: number;
  totalAmount: number;
}

export interface OrdersByType {
  type: 'ONLINE' | 'OFFLINE';
  count: number;
  totalAmount: number;
}

export interface DashboardOrders {
  totalOrders: number;
  ordersByStatus: OrdersByStatus[];
  completedOrders: number;
  canceledOrders: number;
  pendingOrders: number;
  processingOrders: number;
  averageOrderValue: number;
  ordersByType: OrdersByType[];
}

export interface TopCustomer {
  userId: string;
  username: string;
  fullname: string;
  phone: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  rollsBought: number;
  metersBought: number;
  profit: number;
  averageOrderValue: number;
}

export interface FrequencyDistribution {
  oneTime: number;
  occasional: number;
  regular: number;
  loyal: number;
}

export interface PurchaseFrequency {
  totalCustomers: number;
  averageDaysBetweenOrders: number;
  frequencyDistribution: FrequencyDistribution;
}

export interface DashboardCustomers {
  topCustomers: TopCustomer[];
  purchaseFrequency: PurchaseFrequency;
}

export interface LowStockAlert {
  fabricId: number;
  categoryId: number;
  categoryName: string;
  colorId: string;
  colorName: string;
  hexCode: string;
  totalUncutRolls: number;
  totalMeters: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface DashboardInventory {
  lowStockAlerts: LowStockAlert[];
}

export interface DashboardData {
  overview: DashboardOverview;
  revenue: DashboardRevenue;
  profit: DashboardProfit;
  orders: DashboardOrders;
  customers: DashboardCustomers;
  inventory: DashboardInventory;
}

export interface DashboardResponse {
  message: string;
  data: DashboardData;
}
