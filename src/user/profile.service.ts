import { BadRequestException, Injectable } from '@nestjs/common';
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
    const profile = await this.getProfileById(userId);
    const user = profile.user;
    delete profile.user;
    const organization = profile.organization;
    delete profile.organization;
    return {
      ...profile,
      ...user,
      ...organization,
    };
  }

  async editMyProfile(userId: string, dto: EditProfileDto) {
    // update email (from user)
    if (dto.email) {
      await this.updateUserEmail(userId, dto.email);
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
      include: {
        user: {
          select: {
            email: true,
            joinedAt: true,
            isAdmin: true,
            isModerator: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });
    return profile;
  }
  async updateUserEmail(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      if (user.id == userId) {
        throw new Error('This is already your email, Please Enter a new email');
      } else {
        throw new BadRequestException('Email already in use');
      }
    }

    await this.userService.updateEmail(userId, email);
  }
}
