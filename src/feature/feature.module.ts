import { Module } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';

@Module({
  controllers: [FeatureController],
  providers: [FeatureService]
})
export class FeatureModule {}
