import {
  Controller,
  Body,
  Post,
  Headers,
  Param,
  Req,
  UseGuards,
  Res,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  AuthDto,
  PasswordChangeDto,
  PasswordForgotDto,
  PasswordResetDto,
  RegisterDto,
} from './dto';

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
  login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('forgotPassword')
  forgotPassword(
    @Headers('host') host: string,
    @Body() dto: PasswordForgotDto,
  ) {
    return this.authService.forgotPassword(host, dto.email);
  }

  @Post('resetPassword/:token')
  resetPasswordByToken(
    @Param('token') token: string,
    @Body() dto: PasswordResetDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.resetPassword(token, dto.password, res);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('changePassword')
  changePassword(
    @Req() req: Request,
    @Body() dto: PasswordChangeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.changePassword(req, res, dto);
  }
}
