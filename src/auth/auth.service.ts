import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, PasswordChangeDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { HandlePrismaDuplicateError } from '../interceptor/handle.prisma-error';
import * as crypto from 'crypto';
import { EmailService } from './email.service';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}
  // ################################# log in ################################
  async login(dto: AuthDto) {
    // find the user from email (inputted by user)
    const user = await this.findUserByEmail(dto.email);
    // user doesnot exist or input password didnot match with user password
    if (!user || !(await argon.verify(user.password, dto.password))) {
      throw new ForbiddenException('Email or password not matching');
    }
    // find the user name and username- delete if not required
    const profile = user.profile;
    delete user.profile;
    return await this.signToken(user.id, profile.username, profile.name);
  }
  // ################################# Register ################################
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
      return await this.signToken(user.id, profile.username, profile.name);
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
      await this.updatePasswordResetFields(email, undefined, undefined);
      throw new InternalServerErrorException(
        'Error Occured while sending the email. Please Try again later',
      );
    }
  }
  // ################################# reset password ################################
  async resetPassword(token: string, password: string) {
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
    return await this.signToken(
      user.id,
      user.profile.username,
      user.profile.name,
    );
  }
  // ################################# change password ################################
  async changePassword(req: Request, dto: PasswordChangeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: req['user'].id },
    });
    // user doesnot exist or input password didnot match with user password
    if (!user || !(await argon.verify(user.password, dto.oldPassword))) {
      throw new ForbiddenException('Please input correct password');
    }
    const password = await argon.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: req['user'].id },
      data: { password },
    });
  }
  // ################################# helper functions ################################
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

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
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
        passwordChangedAt: new Date(Date.now()),
        passwordResetToken: undefined,
        passwordTokenExpiry: undefined,
      },
    });
  }
}
