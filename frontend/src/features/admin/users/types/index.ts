// ==========================================
// Enums
// ==========================================
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

// ==========================================
// Query Parameters Type
// ==========================================
export interface AdminUserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
  sortDir?: SortDirection;
}

// ==========================================
// Request Body Types
// ==========================================
export interface UserCreateForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateForm {
  fullName: string;
  phone: string;
  address?: string;
  role: UserRole;
}

export interface UserBlockForm {
  isBlocked: boolean;
  reason?: string;
}

// ==========================================
// Response DTO Types
// ==========================================
export interface UserDetailResponse {
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  reason?: string;
  createdAt: string; // Định dạng ISO Date String từ Backend
  updatedAt: string; // Định dạng ISO Date String từ Backend
}

export interface UserListResponse {
  content: UserDetailResponse[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// Wrapper Response chuẩn từ FastAPI ApiResponse
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}