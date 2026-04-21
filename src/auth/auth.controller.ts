import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from '@/common/decorator';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';
import { AuthService } from './auth.service';
import {
  JwtTokenPayload,
  LoginDto,
  PasswordChangeDto,
  PasswordForgotDto,
  PasswordResetDto,
  RegisterDto,
} from './dto';

@UseInterceptors(ResponseTransformInterceptor)
@Controller()
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
