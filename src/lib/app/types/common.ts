/**
 * APP通用类型定义
 */

// 基础响应类型
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 分页相关类型
export interface PaginationParams {
  page?: number;      // 页码，默认1
  limit?: number;     // 每页数量，默认20，最大100
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 通用状态类型
export type Status = "active" | "inactive" | "deleted";

// 设备类型
export type DeviceType = "mobile" | "tablet" | "desktop";

// 排序方向
export type SortDirection = "asc" | "desc";

// 通用查询参数
export interface BaseQueryParams extends PaginationParams {
  sortBy?: string;
  sortDirection?: SortDirection;
  search?: string;
}
