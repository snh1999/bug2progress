import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginDto,
  PasswordChangeDto,
  RegisterDto,
  JwtTokenPayload,
} from './dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { EmailService } from './email.service';
import { Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    const user = await this.findUserByEmail(dto.email);

    if (!(await argon.verify(user.password, dto.password))) {
      throw new ForbiddenException('Email or password not matching');
    }

    if (!user.isActive) {
      await this.reactivateUser(user.id);
    }

    const profile = user.profile;
    if (!profile) {
      throw new NotFoundException('Can not find user, something went wrong');
    }

    return await this.sendCookie(res, {
      id: user.id,
      username: profile.username,
      name: profile.name,
    });
  }

  reactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async register(dto: RegisterDto, res: Response) {
    const hashedPassword = await argon.hash(dto.password);

    const { email, name, username } = dto;

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            ...dto,
          },
        },
      },
    });

    return this.sendCookie(res, {
      id: user.id,
      name,
      username,
    });
  }

  async forgotPassword(host: string, email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new NotFoundException('No user with that email');

    const token = await this.generatePasswordResetToken(email);
    const resetURL = `${host}/resetpassword/${token}`;
    const message = `Forgot password? Follow the link to reset your password: ${resetURL}. If you did not make this request, please ignore this email`;

    const options = {
      email: user.email,
      subject: 'Your password reset token (valid for next 10 min)',
      message,
    };

    try {
      await this.emailService.sendEmail(options);
    } catch (err) {
      console.log(err);
      await this.updatePasswordResetFields(email);
      throw new InternalServerErrorException(
        'Error Occurred while sending the email. Please Try again later',
      );
    }

    return 'Email sent Successfully, Please check your email';
  }

  async generatePasswordResetToken(email: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = this.hashGivenToken(token);

    await this.updatePasswordResetFields(
      email,
      new Date(Date.now() + 15 * 60 * 1000),
      passwordResetToken,
    );

    return token;
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = this.hashGivenToken(token);
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: hashedToken },
      include: { profile: { select: { name: true, username: true } } },
    });

    if (
      !user ||
      !user.passwordTokenExpiry ||
      user.passwordTokenExpiry.getTime() < Date.now()
    ) {
      throw new BadRequestException('Token invalid or expired, Try again');
    }

    await this.updatePassword(user.id, password);

    return 'Password Updated Successfully';
  }

  async changePassword(
    tokenPayload: JwtTokenPayload,
    res: Response,
    dto: PasswordChangeDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: tokenPayload.id },
    });

    if (!(await argon.verify(user.password, dto.oldPassword))) {
      throw new ForbiddenException('Please input correct password');
    }

    const password = await argon.hash(dto.newPassword);
    await this.updatePassword(tokenPayload.id, password);

    return this.sendCookie(res, {
      ...tokenPayload,
    });
  }

  private async sendCookie(res: Response, payload: JwtTokenPayload) {
    const token = await this.signToken(payload);
    const cookieOptions = {
      expires: new Date(new Date().getTime() + 30 * 1000),
      // sameSite: 'strict',
      httpOnly: true,
    };
    // if (this.config.get('Environment') != 'DEV') cookieOptions['secure'] = true;
    res.cookie('token', token, cookieOptions);
    return {
      token,
      message: 'Logged In successfully',
    };
  }

  private async signToken(payload: JwtTokenPayload) {
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('TOKEN_EXPIRY_TIME'),
      secret: this.config.get('JWT_KEY'),
    });
    return token;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { email },
      include: {
        profile: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });
  }

  private hashGivenToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async updatePasswordResetFields(
    email: string,
    passwordTokenExpiry: Date = new Date(),
    passwordResetToken?: string,
  ) {
    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        passwordResetToken,
        passwordTokenExpiry,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
        passwordChangedAt: new Date(Date.now() - 1),
        passwordResetToken: null,
        passwordTokenExpiry: null,
      },
    });
  }
}
