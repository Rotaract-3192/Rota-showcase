import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type TableName = keyof Database['public']['Tables'];

/**
 * Generic Base Repository providing advanced CRUD operations
 * including Pagination, Sorting, Search, and Filtering.
 */
export class BaseRepository<T extends TableName> {
  protected table: T;

  constructor(table: T) {
    this.table = table;
  }

  /** Fetch a single record by ID */
  async findById(id: string): Promise<Database['public']['Tables'][T]['Row'] | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Database['public']['Tables'][T]['Row']) || null;
    } catch (err) {
      handleSupabaseError(err, `${this.table}.findById`);
      return null; // Will not reach here due to throw in handleSupabaseError
    }
  }

  /**
   * Advanced query builder for finding multiple records
   * Supports Search, Pagination, Filtering, and Sorting
   */
  async findMany(options: QueryOptions = {}): Promise<PaginatedResponse<Database['public']['Tables'][T]['Row']>> {
    try {
      let query = supabase
        .from(this.table)
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

      // 1. Filtering
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // 2. Searching
      if (options.search?.query && options.search?.columns && options.search.columns.length > 0) {
        const searchString = options.search.columns
          .map(col => `${col}.ilike.%${options.search!.query}%`)
          .join(',');
        query = query.or(searchString);
      }

      // 3. Sorting
      if (options.sort?.column) {
        query = query.order(options.sort.column, { ascending: options.sort.ascending ?? true });
      } else {
        query = query.order('created_at', { ascending: false }); // Default sort
      }

      // 4. Pagination
      const page = Math.max(1, options.pagination?.page || 1);
      const pageSize = Math.max(1, options.pagination?.pageSize || 20);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);

      // Execute Query
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Database['public']['Tables'][T]['Row'][],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (err) {
      handleSupabaseError(err, `${this.table}.findMany`);
      throw err;
    }
  }

  /** Create a new record */
  async create(payload: Database['public']['Tables'][T]['Insert']): Promise<Database['public']['Tables'][T]['Row']> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .insert(payload as any)
        .select()
        .single();

      if (error) throw error;
      return data as Database['public']['Tables'][T]['Row'];
    } catch (err) {
      handleSupabaseError(err, `${this.table}.create`);
      throw err;
    }
  }

  /** Update an existing record */
  async update(id: string, payload: Database['public']['Tables'][T]['Update']): Promise<Database['public']['Tables'][T]['Row']> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update(payload as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Database['public']['Tables'][T]['Row'];
    } catch (err) {
      handleSupabaseError(err, `${this.table}.update`);
      throw err;
    }
  }

  /** Soft delete a record */
  async softDelete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      handleSupabaseError(err, `${this.table}.softDelete`);
    }
  }
}
