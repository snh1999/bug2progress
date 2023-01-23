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
import { AuthDto, PasswordChangeDto, RegisterDto, TokenSignDto } from './dto';
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
  // ################################# log in ################################
  async login(dto: AuthDto, res: Response) {
    // find the user from email (inputted by user)
    const user = await this.findUserByEmail(dto.email);
    // user doesnot exist or input password didnot match with user password
    if (!user || !(await argon.verify(user.password, dto.password))) {
      throw new ForbiddenException('Email or password not matching');
    }
    if (!user.isActive) {
      await this.reactivateUser(user.id);
    }
    // find the user name and username- delete if not required
    const profile = user.profile;
    delete user.profile;
    return await this.sendCookie(res, {
      id: user.id,
      username: profile.username,
      name: profile.name,
    });
  }

  async reactivateUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }
  // ################################# log in ################################
  logout(res: Response) {
    res.cookie('token', '', { expires: new Date() });
    return {
      token: '',
      message: 'Logged Out successfully',
    };
  }
  // ################################# Register ################################
  async register(dto: RegisterDto, res: Response) {
    // generate hash of input password
    const password = await argon.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password, // hashed
        profile: {
          create: {
            bio: '',
            name: dto.name,
            username: dto.username,
            country: dto.country ? dto.country : '',
            photo: dto.photo ? dto.photo : '',
          },
        },
      },
    });
    return this.sendCookie(res, {
      id: user.id,
      name: dto.username,
      username: dto.name,
    });

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
      return this.sendCookie(res, {
        id: user.id,
        name: profile.username,
        username: profile.name,
      });
    } catch (error) {
      // user is created but username wasnot unique
      if (userNoProfile) {
        await this.prisma.user.delete({
          where: { email: dto.email },
        });
        // new HandlePrismaDuplicateError(error, 'username');
      }
      // new HandlePrismaDuplicateError(error, 'email');
    }
  }
  // ################################# forgot password ##############################
  async forgotPassword(host: string, email: string) {
    // find user by email
    const user = await this.findUserByEmail(email);
    if (!user) throw new NotFoundException('No user with that email');
    const tokenToSend = await this.generatePasswordResetToken(email);
    const resetURL = `${host}/resetpassword/${tokenToSend}`;
    const message = `Forgot password? Follow the link to reset your password: ${resetURL}. If you didnot make this request, please ignore this email`;
    try {
      const options = {
        email: user.email,
        subject: 'Your password reset token (valid for next 10 min)',
        message,
      };
      console.log(options);
      await this.emailService.sendEmail(options); // token send to email
    } catch (err) {
      console.log(err);
      await this.updatePasswordResetFields(email, null, null);
      throw new InternalServerErrorException(
        'Error Occured while sending the email. Please Try again later',
      );
    }
  }

  async generatePasswordResetToken(email: string) {
    const tokenToSend = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = this.hashGivenToken(tokenToSend);

    await this.updatePasswordResetFields(
      email,
      passwordResetToken,
      new Date(Date.now() + 15 * 60 * 1000),
    );

    return tokenToSend;
  }
  // ################################# reset password ################################
  async resetPassword(token: string, password: string, res: Response) {
    // get user from token
    const hashedToken = this.hashGivenToken(token);
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: hashedToken },
      include: { profile: { select: { name: true, username: true } } },
    });
    // if token not expired, and user exists- set new password
    if (!user || user.passwordTokenExpiry.getTime() < Date.now()) {
      throw new BadRequestException('Token invalid or expired, Try again');
    }
    // update password
    await this.updatePassword(user.id, password);
    // log user in(send back jwt)
    return this.sendCookie(res, {
      id: user.id,
      username: user.profile.username,
      name: user.profile.name,
    });
  }
  // ################################# change password ################################
  async changePassword(req: Request, res: Response, dto: PasswordChangeDto) {
    const userId = req['user'].id;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    // user doesnot exist or input password didnot match with user password
    if (!user || !(await argon.verify(user.password, dto.oldPassword))) {
      throw new ForbiddenException('Please input correct password');
    }
    const password = await argon.hash(dto.newPassword);
    await this.updatePassword(userId, password);
    console.log('here');
    return this.sendCookie(res, {
      ...req['user'],
    });
  }
  // ################################# helper functions ################################
  async sendCookie(res: Response, payload: TokenSignDto) {
    const token = await this.signToken(payload);
    const cookieOptions = {
      expires: new Date(new Date().getTime() + 30 * 1000),
      // sameSite: 'strict',
      httpOnly: true,
    };
    if (this.config.get('Environment') != 'DEV') cookieOptions['secure'] = true;
    res.cookie('token', token, cookieOptions);
    return {
      token,
      message: 'Logged In successfully',
    };
  }

  async signToken(payload: TokenSignDto) {
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('TOKEN_EXPIRY_TIME'),
      secret: this.config.get('JWT_KEY'),
    });
    return token;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
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

  hashGivenToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async updatePasswordResetFields(
    email,
    passwordResetToken,
    passwordTokenExpiry,
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
