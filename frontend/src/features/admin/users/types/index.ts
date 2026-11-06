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
  address?: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  reason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UserListResponse {
  content: UserDetailResponse[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
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

export interface UserCreateForm {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole | string;
}

export interface UserUpdateForm {
  fullName: string;
  phone: string;
  address?: string;
  role: UserRole | string;
}

export interface UserBlockForm {
  isBlocked: boolean;
  reason?: string;
}
