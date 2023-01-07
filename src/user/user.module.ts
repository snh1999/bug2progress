import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ProfileService],
})
export class UserModule {}
