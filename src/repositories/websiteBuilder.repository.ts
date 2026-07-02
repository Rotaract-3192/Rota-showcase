import { BaseRepository } from './base.repository';

export class WebsiteBuilderRepository extends BaseRepository<'club_website_configs'> {
  constructor() {
    super('club_website_configs');
  }
}

export const websiteBuilderRepository = new WebsiteBuilderRepository();
