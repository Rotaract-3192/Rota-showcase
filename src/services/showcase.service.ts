import { showcaseRepository } from '@/repositories/showcase.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['showcase_features']['Insert'];
type UpdatePayload = Database['public']['Tables']['showcase_features']['Update'];
type RowData = Database['public']['Tables']['showcase_features']['Row'];

export class ShowcaseService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await showcaseRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await showcaseRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await showcaseRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await showcaseRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await showcaseRepository.softDelete(id);
  }
}

export const showcaseService = new ShowcaseService();
