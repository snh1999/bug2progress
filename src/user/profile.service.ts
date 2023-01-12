import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditProfileDto } from './dto';
import { UserService } from './user.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
  // ########################## view my profile ################################
  async getMyProfile(userId: string) {
    return await this.returnProfile(userId, true);
  }
  // ######################## view profile #############################
  async viewUserProfile(username: string) {
    const userid = await this.getIdFromUsername(username);
    return await this.returnProfile(userid, false);
  }

  async getIdFromUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        username,
      },
      select: {
        userId: true,
      },
    });
    return profile.userId;
  }
  // ########################## edit profile ################################
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
  // ########################## helper functions ################################
  async returnProfile(userid: string, isMe: boolean) {
    const profile = await this.getProfileById(userid);
    const user = profile.user;
    delete profile.user;
    const organization = profile.organization;
    delete profile.organization;
    if (isMe || user.isActive) {
      delete user.isActive;
      return {
        ...profile,
        ...user,
        ...organization,
      };
    } else {
      throw new NotFoundException('Resource not found');
    }
  }
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
            isActive: true,
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
}
