import { Module } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
  imports: [PostModule, UserModule],
})
export class FeatureModule {}
