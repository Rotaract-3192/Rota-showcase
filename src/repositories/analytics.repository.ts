import { BaseRepository } from './base.repository';

export class AnalyticsRepository extends BaseRepository<'analytics_events'> {
  constructor() {
    super('analytics_events');
  }
}

export const analyticsRepository = new AnalyticsRepository();
