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

  async getMyProfile(userId: string) {
    return await this.returnProfile(userId, true);
  }

  async viewProfile(username: string) {
    const userid = await this.userService.getIdFromUser(username);
    return await this.returnProfile(userid, false);
  }

  async editMyProfile(userId: string, dto: EditProfileDto) {
    // update email (from user)
    if (dto.email) {
      await this.updateUserEmail(userId, dto.email);
      delete dto.email;
    }
    // update profile
    return await this.prisma.profile.update({
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
  async returnProfile(userId: string, isMe: boolean) {
    const profile = await this.getProfileById(userId);
    const user = profile?.user;
    // delete profile.user;

    if (isMe || user?.isActive) {
      // delete user.isActive;
      if (isMe)
        return {
          ...profile,
          ...user,
        };
      else return { ...profile };
    } else {
      throw new NotFoundException('404 not found');
    }
  }

  async getProfileById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId: id,
      },
      include: {
        user: true,
      },
    });
    return profile;
  }
}
