import type { Database } from './database.types';

// ==========================================
// Base Utilities
// ==========================================
export type BaseEntity = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ==========================================
// Organization Domain Models
// ==========================================
export type District = Database['public']['Tables']['districts']['Row'];
export type Club = Database['public']['Tables']['clubs']['Row'];

// ==========================================
// Identity Domain Models
// ==========================================
export type MemberProfile = Database['public']['Tables']['member_profiles']['Row'];

// ==========================================
// Common Pagination/Filtering
// ==========================================
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}
