import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { EditProfileDto } from './dto';

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
}
