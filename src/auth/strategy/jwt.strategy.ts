import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false,
      secretOrKey: config.get('JWT_KEY'),
    });
  }
  async validate(payload: any) {
    // check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    // check if password was changed after the token was issued
    const passwordChangedAt = user.passwordChangedAt.getTime() / 1000 - 1; // parseInt(user.passwordChangedAt.getTime() / 1000);
    if (payload.iat < passwordChangedAt)
      throw new UnauthorizedException('Password Changed, Please Log in again');
    return payload;
  }
}
