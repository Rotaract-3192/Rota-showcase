import { BaseRepository } from './base.repository';

export class OrientationRepository extends BaseRepository<'orientations'> {
  constructor() {
    super('orientations');
  }
}

export const orientationRepository = new OrientationRepository();
