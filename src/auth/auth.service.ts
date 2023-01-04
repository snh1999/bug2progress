import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    let passwordMatch = false;
    if (user) {
      passwordMatch = await argon.verify(user.password, dto.password);
    }

    if (!user || !passwordMatch) {
      throw new ForbiddenException('Email or password not matching');
    }
    return this.signToken(user.id);
  }

  async register(dto: RegisterDto) {
    // generate hash
    const password = await argon.hash(dto.password);
    let userNoProfile = false;
    try {
      // save to db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password,
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
      return this.signToken(user.id);
    } catch (error) {
      // user is created but username wasnot unique
      if (userNoProfile) {
        await this.prisma.user.delete({
          where: {
            email: dto.email,
          },
        });
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        if (userNoProfile) {
          throw new ForbiddenException('Username already exists');
        } else {
          throw new ForbiddenException('Email already exists');
        }
      } else {
        throw error;
      }
    }
  }

  async signToken(userId: string): Promise<{ token: string }> {
    const payload = {
      sub: userId, //uniquw identifier for sub field
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('TOKEN_EXPIRY_TIME'),
      secret: this.config.get('JWT_KEY'),
    });
    return {
      token,
    };
  }
}
