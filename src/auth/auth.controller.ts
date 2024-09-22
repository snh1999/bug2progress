import {
  Controller,
  Body,
  Post,
  Headers,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  PasswordChangeDto,
  PasswordForgotDto,
  PasswordResetDto,
  RegisterDto,
  JwtTokenPayload,
} from './dto';
import { GetUser } from '@/common/decorator';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(dto, res);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('forgot-password')
  forgotPassword(
    @Headers('host') host: string,
    @Body() dto: PasswordForgotDto,
  ) {
    return this.authService.forgotPassword(host, dto.email);
  }

  @Post('reset-password/:token')
  resetPasswordByToken(
    @Param('token') token: string,
    @Body() dto: PasswordResetDto,
  ) {
    return this.authService.resetPassword(token, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  changePassword(
    @GetUser() tokenPayload: JwtTokenPayload,
    @Body() dto: PasswordChangeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.changePassword(tokenPayload, res, dto);
  }
}
