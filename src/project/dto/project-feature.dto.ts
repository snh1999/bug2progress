import { FeatureType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ProjectFeatureDto {
  @IsEnum(FeatureType)
  @IsOptional()
  featureType?: FeatureType;
}
