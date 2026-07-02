// ==========================================
// API & Query Models
// ==========================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  column?: string;
  ascending?: boolean;
}

export interface SearchParams {
  query?: string;
  columns?: string[]; // e.g., ['name', 'description']
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  search?: SearchParams;
  filters?: FilterParams;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
