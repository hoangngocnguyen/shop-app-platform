export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Quản trị viên",
  [UserRole.CUSTOMER]: "Khách hàng",
  [UserRole.STAFF]: "Nhân viên",
};

export function getUserRoleLabel(role: UserRole | string): string {
  return USER_ROLE_LABELS[role as UserRole] ?? role;
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export interface UserDetailResponse {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  shippingAddresses?: ShippingAddressResponse[];
  role: UserRole | string;
  status: UserStatus | string;
  reason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ShippingAddressResponse {
  id: number;
  recipientName?: string | null;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  detailAddress?: string | null;
  isDefault: boolean;
}

export interface UserBlockForm {
  isBlocked: boolean;
  reason?: string;
}

export interface UserRoleUpdateForm {
  role: UserRole;
}

export interface UserListResponse {
  content: UserDetailResponse[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface UserStatsResponse {
  total: number;
  customers: number;
  admins: number;
  staff: number;
  blocked: number;
}

export interface AdminUserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: UserRole | string;
  status?: UserStatus | string;
  sortBy?: string;
  sortDir?: SortDirection | "asc" | "desc";
}

export interface UserOrderItem {
  order_id: string;
  recipient_name: string;
  recipient_phone?: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface UserOrdersPaginated {
  items: UserOrderItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserDetailStatisticsResponse {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  shipping_addresses?: ShippingAddressResponse[];
  role: string;
  status: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  orders: UserOrdersPaginated;
}

export interface UserStatisticsQueryParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}