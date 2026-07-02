import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<'notifications'> {
  constructor() {
    super('notifications');
  }
}

export const notificationRepository = new NotificationRepository();
