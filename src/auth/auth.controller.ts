import {
  Controller,
  Body,
  Post,
  Headers,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  AuthDto,
  PasswordChangeDto,
  passwordForgotDto,
  RegisterDto,
} from './dto';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('forgotPassword')
  forgotPassword(
    @Headers('host') host: string,
    @Body() dto: passwordForgotDto,
  ) {
    return this.authService.forgotPassword(host, dto.email);
  }

  @Post('resetPassword/:token')
  resetPasswordByToken(
    @Param('token') token: string,
    @Body() dto: { password: string },
  ) {
    return this.authService.resetPassword(token, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resetPassword')
  resetPassword(@Req() req: Request, @Body() dto: PasswordChangeDto) {
    return this.authService.changePassword(req, dto);
  }
}
