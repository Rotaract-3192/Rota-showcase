import { meetingRepository } from '@/repositories/meeting.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['meetings']['Insert'];
type UpdatePayload = Database['public']['Tables']['meetings']['Update'];
type RowData = Database['public']['Tables']['meetings']['Row'];

export class MeetingService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await meetingRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await meetingRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await meetingRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await meetingRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await meetingRepository.softDelete(id);
  }
}

export const meetingService = new MeetingService();
