import { BaseRepository } from './base.repository';

export class InstallationRepository extends BaseRepository<'installations'> {
  constructor() {
    super('installations');
  }
}

export const installationRepository = new InstallationRepository();
