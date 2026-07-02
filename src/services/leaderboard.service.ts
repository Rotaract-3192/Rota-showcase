import { leaderboardRepository } from '@/repositories/leaderboard.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['point_ledgers']['Insert'];
type UpdatePayload = Database['public']['Tables']['point_ledgers']['Update'];
type RowData = Database['public']['Tables']['point_ledgers']['Row'];

export class LeaderboardService {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await leaderboardRepository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await leaderboardRepository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await leaderboardRepository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await leaderboardRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await leaderboardRepository.softDelete(id);
  }
}

export const leaderboardService = new LeaderboardService();
