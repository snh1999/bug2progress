import { ApiProperty } from '@nestjs/swagger';
import { FeatureType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'REQUIRED- title for the post',
    example: 'My first feature',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'REQUIRED- description/content for the post',
    example: 'Just an example, Nothing serious',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'OPTIONAL- the entire process to implement the feature',
    example: '...',
  })
  @IsString()
  @IsOptional()
  process?: string;

  @ApiProperty({
    description: 'OPTIONAL- to configure visibility of the process',
    example: 'true(default)',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(FeatureType)
  @IsOptional()
  featureType?: FeatureType;
}
