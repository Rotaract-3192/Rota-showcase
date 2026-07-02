import { orientationRepository } from '@/repositories/orientation.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['orientations']['Insert'];
type UpdatePayload = Database['public']['Tables']['orientations']['Update'];
type RowData = Database['public']['Tables']['orientations']['Row'];

export class OrientationService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await orientationRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await orientationRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await orientationRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await orientationRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await orientationRepository.softDelete(id);
  }
}

export const orientationService = new OrientationService();
