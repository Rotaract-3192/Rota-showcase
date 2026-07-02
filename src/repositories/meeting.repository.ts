import { BaseRepository } from './base.repository';

export class MeetingRepository extends BaseRepository<'meetings'> {
  constructor() {
    super('meetings');
  }
}

export const meetingRepository = new MeetingRepository();
