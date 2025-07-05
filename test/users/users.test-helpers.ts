import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from '@/auth/dto';
import { getRegisterDto } from '../auth/auth.test-data';

export async function createTestUser(
  prisma: PrismaService,
  userData?: RegisterDto,
) {
  if (!userData) {
    userData = getRegisterDto();
  }

  return prisma.user.create({
    data: {
      ...userData,
      profile: { create: userData },
    },
  });
}
