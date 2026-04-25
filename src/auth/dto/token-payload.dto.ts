import { Role } from '@/common/types';

export class JwtTokenPayload {
  id!: string;
  username!: string;
  name!: string;
  role?: Role;
}
