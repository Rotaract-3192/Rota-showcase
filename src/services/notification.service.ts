import { notificationRepository } from '@/repositories/notification.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['notifications']['Insert'];
type UpdatePayload = Database['public']['Tables']['notifications']['Update'];
type RowData = Database['public']['Tables']['notifications']['Row'];

export class NotificationService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await notificationRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await notificationRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await notificationRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await notificationRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await notificationRepository.softDelete(id);
  }
}

export const notificationService = new NotificationService();
