import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from '@/auth/dto';
import { getRegisterDto } from '../auth/auth.test-data';
import * as argon from 'argon2';

export async function createTestUser(
  prisma: PrismaService,
  userData?: RegisterDto,
) {
  if (!userData) {
    userData = getRegisterDto();
  }

  const { email, password, ...profileData } = userData;
  const hashedPassword = await argon.hash(password);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      profile: { create: profileData },
    },
  });
}
