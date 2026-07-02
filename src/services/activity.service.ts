import { activityRepository } from '@/repositories/activity.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['activities']['Insert'];
type UpdatePayload = Database['public']['Tables']['activities']['Update'];
type RowData = Database['public']['Tables']['activities']['Row'];

export class ActivityService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await activityRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await activityRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await activityRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await activityRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await activityRepository.softDelete(id);
  }
}

export const activityService = new ActivityService();
