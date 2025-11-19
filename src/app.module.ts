import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { PostModule } from './post/post.module';
import { ProjectModule } from './project/project.module';
import { TicketModule } from './ticket/ticket.module';
import { PostCommentModule } from './post-comment/post-comment.module';
import { TicketCommentModule } from './ticket-comment/ticket-comment.module';
import { FeatureModule } from './feature/feature.module';
import { AllExceptionsFilter } from './common/interceptor/exceptions.filter';
import { validate } from './common/config/env.validation';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', validate }),
    UserModule,
    OrganizationModule,
    PostModule,
    ProjectModule,
    TicketModule,
    PostCommentModule,
    TicketCommentModule,
    FeatureModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
