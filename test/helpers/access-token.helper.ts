import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';
import { createTestUser } from '../users/users.test-helpers';
import { getRegisterDto } from '../auth/auth.test-data';

export async function getAccessToken(
  prisma: PrismaService,
  jwtService: JwtService,
  user?: User,
) {
  const userData = getRegisterDto();

  if (!user) {
    user = await createTestUser(prisma, userData);
  }

  return jwtService.sign({
    id: user.id,
    name: userData.name,
    username: userData.username,
  });
}
