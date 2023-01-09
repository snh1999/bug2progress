import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { HandlePrismaDuplicateError } from '../interceptor/handle.prisma-error';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    // find the user from email (inputted by user)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // user doesnot exist or input password didnot match with user password
    if (!user || !(await argon.verify(user.password, dto.password))) {
      throw new ForbiddenException('Email or password not matching');
    }
    // find the user name and username- delete if not required
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });
    // check if password was changed after the token was issued
    return this.signToken(user.id, profile.username, profile.name);
  }

  async register(dto: RegisterDto) {
    // generate hash of input password
    const password = await argon.hash(dto.password);
    // flag to check if username is incorrect (user created but not profile)
    let userNoProfile = false;
    // save to db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password, // hashed
        },
      });
      userNoProfile = true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const profile = await this.prisma.profile.create({
        data: {
          userId: user.id,
          bio: '',
          name: dto.name,
          username: dto.username,
          country: dto.country ? dto.country : '',
          photo: dto.photo ? dto.photo : '',
        },
      });
      // return token
      return this.signToken(user.id, profile.username, profile.name);
    } catch (error) {
      // user is created but username wasnot unique
      if (userNoProfile) {
        await this.prisma.user.delete({
          where: { email: dto.email },
        });
        new HandlePrismaDuplicateError(error, 'username');
      }
      new HandlePrismaDuplicateError(error, 'email');
    }
  }

  async signToken(
    userId: string,
    username: string,
    name: string,
  ): Promise<{ token: string }> {
    const payload = {
      id: userId,
      username,
      name,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('TOKEN_EXPIRY_TIME'),
      secret: this.config.get('JWT_KEY'),
    });
    return { token };
  }
}
