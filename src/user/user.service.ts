import { ForbiddenException, Injectable } from '@nestjs/common';
import { HandlePrismaDuplicateError } from 'src/interceptor/handle.prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // leave organization
  // change organization

  // deactivate account
  async deactivateMyProfile(userId: string, password: string) {
    // check if user password is correct
    if (!(await this.checkPassword(userId, password)))
      throw new ForbiddenException('Please input correct password');
    // passwordchangedat modified to invalidate the token
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, passwordChangedAt: new Date(Date.now()) },
    });
    return {
      status: 'sucess',
      message: 'Log back in to reactivate your account',
    };
    // logout
  }
  // delete account
  async deleteMyProfile(userId: string, password: string) {
    // check if user password is correct
    if (!(await this.checkPassword(userId, password)))
      throw new ForbiddenException('Please input correct password');
    // delete user
    await this.prisma.user.delete({
      where: { id: userId },
    });
    // logout
  }

  // ########################## helper functions ################################
  async checkPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    // user doesnot exist or input password didnot match with user password
    if (!user || !(await argon.verify(user.password, password))) {
      return false;
    }
    return true;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }

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
