import { Injectable, Req } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(@Req() req: Request) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: req['user'],
      },
    });
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId: req['user'],
      },
    });
    console.log(user, profile);
    return {
      username: profile.username,
      id: user.id,
      joined: user.joinedAt,
      email: user.email,
      organization: user.organizationId,
      isAdmin: user.isAdmin,
      isModerator: user.isModerator,
      bio: profile.bio,
      name: profile.name,
      country: profile.country,
      birthday: profile.birthday,
      photo: profile.photo,
    };
  }
}
