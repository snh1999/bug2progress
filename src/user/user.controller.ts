import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../common/decorator/get-user.decorator';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { EditProfileDto, InputPasswordDto } from './dto';
import { Public, Roles } from '../common/decorator';
import { JwtAuthGuard, RolesGuard } from '../common/guard';
import { Role } from '../common/dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private profileService: ProfileService,
  ) {}

  // pagination maybe
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  // view all active user

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':username')
  deleteUser(@Param('username') username: string) {
    return this.userService.deleteUser(username);
  }

  @Get('me')
  getMyProfile(@GetUser('id') userId: string) {
    return this.profileService.getMyProfile(userId);
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

  @Public()
  @Get(':username')
  viewProfile(@Param('username') username: string) {
    return this.profileService.viewProfile(username);
  }
}
