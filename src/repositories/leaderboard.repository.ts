import { BaseRepository } from './base.repository';

export class LeaderboardRepository extends BaseRepository<'point_ledgers'> {
  constructor() {
    super('point_ledgers');
  }
}

export const leaderboardRepository = new LeaderboardRepository();
