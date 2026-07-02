import { installationRepository } from '@/repositories/installation.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['installations']['Insert'];
type UpdatePayload = Database['public']['Tables']['installations']['Update'];
type RowData = Database['public']['Tables']['installations']['Row'];

export class InstallationService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await installationRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await installationRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await installationRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await installationRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await installationRepository.softDelete(id);
  }
}

export const installationService = new InstallationService();
