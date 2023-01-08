import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditProfileDto } from './dto';
import { UserService } from './user.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
  // ########################## route functions ################################
  async getProfile(userId: string) {
    const user = await this.userService.getUserById(userId);
    const profile = await this.getProfileById(userId);
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

  async editMyProfile(userId: string, dto: EditProfileDto) {
    // update email (from user)
    if (dto.email) {
      await this.userService.updateEmail(userId, dto.email);
      delete dto.email;
    }
    // update profile
    await this.prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        ...dto,
      },
    });
  }
  // ########################## helper functions ################################
  async getProfileById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId: id,
      },
    });
    return profile;
  }
}
