import { BaseRepository } from './base.repository';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { handleSupabaseError } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

const ACTIVITY_SELECT = '*, clubs(name, zone)';

export class ActivityRepository extends BaseRepository<'activities'> {
  constructor() {
    super('activities');
  }

  async findById(id: string): Promise<Database['public']['Tables']['activities']['Row'] | null> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('activities')
        .select(ACTIVITY_SELECT)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Database['public']['Tables']['activities']['Row'] | null;
    } catch (err) {
      handleSupabaseError(err, 'activities.findById');
      return null;
    }
  }

  async findMany(options: QueryOptions = {}): Promise<PaginatedResponse<Database['public']['Tables']['activities']['Row']>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('activities')
        .select(ACTIVITY_SELECT, { count: 'exact' })
        .is('deleted_at', null);

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (options.search?.query && options.search.columns && options.search.columns.length > 0) {
        const searchString = options.search.columns
          .map((col) => `${col}.ilike.%${options.search!.query}%`)
          .join(',');
        query = query.or(searchString);
      }

      if (options.sort?.column) {
        query = query.order(options.sort.column, { ascending: options.sort.ascending ?? true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const page = Math.max(1, options.pagination?.page || 1);
      const pageSize = Math.max(1, options.pagination?.pageSize || 20);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data || []) as Database['public']['Tables']['activities']['Row'][],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (err) {
      handleSupabaseError(err, 'activities.findMany');
      throw err;
    }
  }
}

export const activityRepository = new ActivityRepository();
