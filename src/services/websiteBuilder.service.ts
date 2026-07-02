import { websiteBuilderRepository } from '@/repositories/websiteBuilder.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['club_website_configs']['Insert'];
type UpdatePayload = Database['public']['Tables']['club_website_configs']['Update'];
type RowData = Database['public']['Tables']['club_website_configs']['Row'];

export class WebsiteBuilderService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await websiteBuilderRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await websiteBuilderRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await websiteBuilderRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await websiteBuilderRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await websiteBuilderRepository.softDelete(id);
  }
}

export const websiteBuilderService = new WebsiteBuilderService();
