import { dovRepository } from '@/repositories/dov.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['dovs']['Insert'];
type UpdatePayload = Database['public']['Tables']['dovs']['Update'];
type RowData = Database['public']['Tables']['dovs']['Row'];

export class DovService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await dovRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await dovRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await dovRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await dovRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await dovRepository.softDelete(id);
  }
}

export const dovService = new DovService();
