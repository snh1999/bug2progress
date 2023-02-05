import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
// TODO- figure out the way to add links
// TODO- Maybe process = a file
export class CreateFeatureDto {
  @ApiProperty({
    description: 'REQUIRED- title for the post',
    example: 'My first feature',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'REQUIRED- description/content for the post',
    example: 'Just an example, Nothing serious',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

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
  ispublic?: boolean;
}
