import { IsOptional, IsString } from 'class-validator';
export class TicketRoles {
  @IsString()
  @IsOptional()
  varifierId?: string;

  @IsString()
  @IsOptional()
  closeId?: string;

  @IsString()
  @IsOptional()
  assignedId?: string;

  @IsString()
  @IsOptional()
  developerId?: string;
}
