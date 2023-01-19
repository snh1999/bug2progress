import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketType } from '@prisma/client';
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketType)
  @IsNotEmpty()
  ticketType: TicketType;

  @IsString()
  @IsNotEmpty()
  projectId: string; // maybe url

  @IsString()
  @IsOptional()
  projectXFeaturesFeaturesId?: string;
}
