import { BaseRepository } from './base.repository';

export class ActivityRepository extends BaseRepository<'activities'> {
  constructor() {
    super('activities');
  }
}

export const activityRepository = new ActivityRepository();
