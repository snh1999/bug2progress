import {
  IsNotEmpty,
  IsString,
  IsAlphanumeric,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  postContent!: string;

  @IsArray()
  @IsOptional()
  attachmentFiles?: string[];

  @IsAlphanumeric()
  @IsOptional()
  organizationId?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
