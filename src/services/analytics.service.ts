import { analyticsRepository } from '@/repositories/analytics.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['analytics_events']['Insert'];
type UpdatePayload = Database['public']['Tables']['analytics_events']['Update'];
type RowData = Database['public']['Tables']['analytics_events']['Row'];

export class AnalyticsService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await analyticsRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await analyticsRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await analyticsRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await analyticsRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await analyticsRepository.softDelete(id);
  }
}

export const analyticsService = new AnalyticsService();
