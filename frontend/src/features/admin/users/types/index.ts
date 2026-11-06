export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
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
