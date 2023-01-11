import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { EditProfileDto, InputPasswordDto } from './dto';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private profileService: ProfileService,
  ) {}

  @Get('me')
  getMyProfile(@GetUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch('me')
  editMyProfile(@GetUser('id') userid: string, @Body() dto: EditProfileDto) {
    return this.profileService.editMyProfile(userid, dto);
  }

  @Post('me/delete')
  deleteMyProfile(
    @GetUser('id') userId: string,
    @Body() dto: InputPasswordDto,
  ) {
    return this.userService.deleteMyProfile(userId, dto.password);
  }

  @Post('me/deactivate')
  deactivateMyProfile(
    @GetUser('id') userId: string,
    @Body() dto: InputPasswordDto,
  ) {
    return this.userService.deactivateMyProfile(userId, dto.password);
  }
}
