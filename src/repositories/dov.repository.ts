import { BaseRepository } from './base.repository';

export class DovRepository extends BaseRepository<'dovs'> {
  constructor() {
    super('dovs');
  }
}

export const dovRepository = new DovRepository();
