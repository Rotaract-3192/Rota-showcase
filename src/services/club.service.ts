import { clubRepository } from '@/repositories/club.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['clubs']['Insert'];
type UpdatePayload = Database['public']['Tables']['clubs']['Update'];
type RowData = Database['public']['Tables']['clubs']['Row'];

export class ClubService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await clubRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await clubRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await clubRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await clubRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await clubRepository.softDelete(id);
  }
}

export const clubService = new ClubService();
