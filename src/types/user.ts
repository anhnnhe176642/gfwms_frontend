import type { PaginationState } from './common';
import type { CreditRegistration } from './creditRegistration';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserGender = 'MALE' | 'FEMALE';

export type UserListItem = {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  gender?: UserGender | null;
  address?: string | null;
  dob?: string | null; // Date of birth
  fullname?: string | null;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    name: string;
    description?: string | null;
  };
  creditRegistration?: CreditRegistration | null;
  permissionKeys?: string[];
  lastLogin?: string;
};

export type UserListResponse = {
  message: string;
  data: UserListItem[];
  pagination: PaginationState;
};

export type UserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // e.g., "ACTIVE,INACTIVE"
  role?: string; // e.g., "ADMIN,USER"
  gender?: string; // e.g., "MALE,FEMALE"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
  sortBy?: string; // e.g., "createdAt,username"
  order?: string; // e.g., "desc,asc"
};

export type UpdateUserStatusPayload = {
  userId: string | number;
  status: UserStatus;
};

export type UpdateUserRolePayload = {
  userId: string | number;
  roleName: string; // Tên của role từ database
};

// Profile Management Types
export type UpdateProfileDTO = {
  fullname?: string;
  phone?: string;
  gender?: UserGender;
  address?: string;
  dob?: string; // ISO date string (YYYY-MM-DD)
};

export type ChangePasswordDTO = {
  currentPassword: string;
  newPassword: string;
};

export type ProfileUser = {
  id: string;
  username: string;
  email: string;
  fullname: string | null;
  phone: string | null;
  gender: UserGender | null;
  address: string | null;
  dob: string | null; // ISO date
  avatar: string | null;
  avatarPublicId?: string | null;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    name: string;
    description?: string | null;
  };
  permissionKeys?: string[];
  creditRegistration?: CreditRegistration | null;
};

export type ProfileResponse = {
  message: string;
  user: ProfileUser;
};

export type UserDetailResponse = {
  message: string;
  user: {
    id: string;
    username: string;
    phone: string | null;
    email: string;
    avatar: string | null;
    avatarPublicId: string | null;
    gender: UserGender | null;
    address: string | null;
    dob: string | null;
    fullname: string | null;
    status: UserStatus;
    emailVerified: boolean;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    role: string;
    creditRegistration: CreditRegistration | null;
  };
};

export type PermissionItem = {
  id: number;
  key: string;
  description: string;
};

export type UserPermissionsData = {
  userId: string;
  roleName: string;
  roleFullName: string;
  roleDescription: string;
  permissions: PermissionItem[];
};

export type UserPermissionsResponse = {
  message: string;
  data: UserPermissionsData;
};

export type UpdateAvatarResponse = {
  message: string;
  user: {
    avatar: string;
    avatarPublicId: string;
  };
};

export type ChangePasswordResponse = {
  message: string;
};

// ============================================
// User Stats & Activity Types (Updated API)
// ============================================

// Order Stats Types
export type OrderSummary = {
  asCustomer: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: string;
  };
  asStaff: {
    totalCreated: number;
    totalAmount: number;
    averageOrderValue: string;
  };
};

export type OrderBreakdown = Record<string, number>;

export type RecentOrder = {
  id: number;
  status: string;
  totalAmount: number;
  orderDate: string;
  isOffline: boolean;
};

export type OrderStats = {
  summary: OrderSummary;
  breakdown: OrderBreakdown;
  recentOrders: RecentOrder[];
};

// Export Stats Types
export type ExportSummary = {
  totalExports: number;
};

export type ExportBreakdown = Record<string, number>;

export type RecentExport = {
  id: number;
  status: string;
  createdAt: string;
  warehouse: {
    name: string;
  };
  store: {
    name: string;
  };
};

export type ExportStats = {
  summary: ExportSummary;
  breakdown: ExportBreakdown;
  recentExports: RecentExport[];
};

// Import Stats Types
export type ImportSummary = {
  totalImports: number;
  totalCost: number;
  averageCost: string;
};

export type ImportBreakdown = Record<string, number>;

export type RecentImport = {
  id: number;
  status: string;
  totalPrice: number;
  importDate: string;
  warehouse: {
    name: string;
  };
};

export type ImportStats = {
  summary: ImportSummary;
  breakdown: ImportBreakdown;
  recentImports: RecentImport[];
};

// Payment Stats Types
export type PaymentSummary = {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  invoicePayments: number;
  creditPayments: number;
  averagePayment: string;
};

export type RecentPayment = {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
};

export type PaymentStats = {
  summary: PaymentSummary;
  recentPayments: RecentPayment[];
};

// Credit Info Types
export type CreditInfo = {
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  utilizationRate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isCritical: boolean;
  createdAt: string;
};

export type CreditRequestData = {
  id?: number;
  requestLimit?: number;
  type?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
};

export type CreditRequestsStats = {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  data: CreditRequestData[];
};

// Managed Resources Types
export type ManagedStoreDetail = {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  ordersCount: number;
  exportsCount: number;
};

export type ManagedStoresStats = {
  total: number;
  details: ManagedStoreDetail[];
};

export type ManagedWarehouseDetail = {
  id: number;
  name: string;
  address: string;
  status: string;
  createdAt: string;
  shelvesCount: number;
  importsCount: number;
};

export type ManagedWarehousesStats = {
  total: number;
  details: ManagedWarehouseDetail[];
};

// Main Stats Response Type
export type UserStatsData = {
  orderStats: OrderStats;
  exportStats: ExportStats;
  importStats: ImportStats;
  paymentStats: PaymentStats;
  creditInfo: CreditInfo;
  creditRequests: CreditRequestsStats;
  managedStores: ManagedStoresStats;
  managedWarehouses: ManagedWarehousesStats;
};

export type UserStatsResponse = {
  message: string;
  data: UserStatsData;
};

// ============================================
// Activity Dashboard Types (Updated API)
// ============================================

export type OrderMetrics = {
  total: number;
  last7Days: number;
  last30Days: number;
  totalCount: number;
  recentOrders: RecentOrder[];
};

export type ExportMetrics = {
  totalCreated: number;
  totalCompleted: number;
  totalExports: number;
  createdTrend: {
    last7Days: number;
    last30Days: number;
    totalCount: number;
  };
  completedTrend: {
    last7Days: number;
    last30Days: number;
    totalCount: number;
  };
  recentExports: RecentExport[];
};

export type ImportMetrics = {
  total: number;
  last7Days: number;
  last30Days: number;
  totalCount: number;
  recentImports: RecentImport[];
};

export type PaymentMetrics = {
  total: number;
  last7Days: number;
  last30Days: number;
  totalCount: number;
  recentPayments: RecentPayment[];
};

export type ActivityMetricsData = {
  totalActivities: number;
  orderMetrics: OrderMetrics;
  exportMetrics: ExportMetrics;
  importMetrics: ImportMetrics;
  paymentMetrics: PaymentMetrics;
};

export type UserActivity = {
  id: string;
  userId: string;
  activityType: string;
  entityType: string;
  entityId: number;
  description: string;
  createdAt: string;
};

export type ActivityTimeline = {
  recentActivities: UserActivity[];
  lastActivityAt: string;
  firstActivityAt: string;
  totalActivitiesCount: number;
};

export type ActivityTrends = {
  activityLast7Days: number;
  activityLast30Days: number;
  avgActivitiesPerDay: number;
};

export type UserActivityDashboard = {
  activityMetrics: ActivityMetricsData;
  activityBreakdown: Record<string, number>;
  activityTimeline: ActivityTimeline;
  trends: ActivityTrends;
};

export type UserActivityDashboardResponse = {
  message: string;
  data: UserActivityDashboard;
};

