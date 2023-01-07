import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId: id,
      },
    });
    return profile;
  }
}
