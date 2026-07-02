import { BaseRepository } from './base.repository';

export class ShowcaseRepository extends BaseRepository<'showcase_features'> {
  constructor() {
    super('showcase_features');
  }
}

export const showcaseRepository = new ShowcaseRepository();
