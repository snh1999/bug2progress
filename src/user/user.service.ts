import { Injectable } from '@nestjs/common';
import { HandlePrismaDuplicateError } from 'src/interceptor/handle.prisma-error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // leave organization
  // change organization

  // deactivate account

  // delete account

  // edit profile

  // reset password

  // ########################## helper functions ################################
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }
  // change email
  async updateEmail(userId: string, email: string) {
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          email,
        },
      });
    } catch (error) {
      new HandlePrismaDuplicateError(error, 'email');
    }
  }
}
