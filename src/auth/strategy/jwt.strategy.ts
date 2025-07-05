import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JWTStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // ignoreExpiration: false,
      secretOrKey: config.get('JWT_KEY'),
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'token' in req.cookies) {
      return req.cookies.token;
    }
    return null;
  }

  async validate(payload: any) {
    // check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User does not exist. Please Log in to continue',
      );
    }
    const passwordChangedAt = user.passwordChangedAt.getTime() / 1000 - 1;
    if (payload.iat < passwordChangedAt)
      throw new UnauthorizedException('Please Log in again to continue');
    return {
      id: payload.id,
      name: payload.name,
      username: payload.username,
      role: user.role,
    };
  }
}
