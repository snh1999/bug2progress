import { Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
  imports: [UserModule],
})
export class OrganizationModule {}
