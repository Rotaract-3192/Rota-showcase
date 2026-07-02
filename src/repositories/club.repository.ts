import { BaseRepository } from './base.repository';

export class ClubRepository extends BaseRepository<'clubs'> {
  constructor() {
    super('clubs');
  }
}

export const clubRepository = new ClubRepository();
