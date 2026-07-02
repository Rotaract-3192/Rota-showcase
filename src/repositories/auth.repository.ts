import { BaseRepository } from './base.repository';

export class AuthRepository extends BaseRepository<'member_profiles'> {
  constructor() {
    super('member_profiles');
  }
}

export const authRepository = new AuthRepository();
