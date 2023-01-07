import { Injectable, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from './profile.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfileService,
  ) {}
  async getMyProfile(@Req() req: Request) {
    const userId = req['user'].id;

    const user = await this.getUser(userId);
    const profile = await this.profileService.getProfile(userId);
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

  private async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }
}
