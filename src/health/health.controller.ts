import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ServiceUnavailableException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FeatureType, Role, Ticket } from '@prisma/client';
import * as argon from 'argon2';
import { GetUser } from '@/common/decorator/get-user.decorator';
import { JwtAuthGuard } from '@/common/guard';
import {
  COMMENT_TEXTS,
  FEATURE_TITLES,
  generateTickets,
  getOrganizationData,
  getPostData,
  getProjectData,
  pickRandom,
  TICKET_COMMENTS,
} from './demo.data';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  private async upsertTestUser(email: string, name: string, username: string) {
    const hashedPassword = await argon.hash('password123');

    return this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        role: Role.USER,
        profile: {
          create: {
            name,
            username,
            bio: `${name} is a demo user for testing`,
            country: 'BD',
            photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          },
        },
      },
      include: { profile: true },
    });
  }

  @Post('setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ResponseTransformInterceptor)
  async generateDemo(@GetUser('id') userId: string, allData: boolean = false) {
    const [userOrgs, userProjects] = await Promise.all([
      this.prisma.orgMembers.count({ where: { userId } }),
      this.prisma.projectContributor.count({ where: { userId } }),
    ]);

    if (userOrgs > 2 || userProjects > 3) {
      throw new Error('You already have data');
    }

    const startTime = Date.now();
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!currentUser) {
      throw new ForbiddenException('Current user not found');
    }

    const testEmail = `test+${userId}@gmail.com`;
    const demoEmail = `demo+${userId}@gmail.com`;
    const testUser = await this.upsertTestUser(
      testEmail,
      'Test User',
      testEmail.slice(0, 11),
    );
    const demoUser = await this.upsertTestUser(
      demoEmail,
      'Demo User',
      demoEmail.slice(0, 11),
    );

    const allUsers = [currentUser, testUser, demoUser];

    const orgs = await Promise.all(
      getOrganizationData(userId, allUsers).map((data) =>
        this.prisma.organization.create({ data }),
      ),
    );

    const posts = await Promise.all(
      getPostData(userId, allUsers, orgs).map((data) =>
        this.prisma.post.create({ data }),
      ),
    );

    const projectDefs = getProjectData(allUsers, posts);

    const projects = await Promise.all(
      projectDefs.map((p) =>
        this.prisma.project.create({
          data: {
            title: p.title,
            summary: p.summary,
            urlid: p.urlid,
            status: p.status,
            isPublic: p.isPublic,
            ownerId: p.ownerId,
            basePostId: p.postId,
            members: { create: p.members },
          },
        }),
      ),
    );

    const features: { id: string; projectId: string; ownerId: string }[] = [];
    for (const [idx, project] of projects.entries()) {
      const projectMembers = projectDefs[idx].members;
      const numFeatures = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numFeatures; i++) {
        const feature = await this.prisma.features.create({
          data: {
            title: pickRandom(FEATURE_TITLES),
            description: `Core feature for ${project.title}`,
            necessaryLinks: [],
            process: '1. Design\n2. Implement\n3. Test\n4. Deploy',
            featureType: pickRandom(Object.values(FeatureType)),
            projectId: project.id,
            ownerId: projectMembers[i % projectMembers.length].userId,
          },
        });
        features.push({
          id: feature.id,
          projectId: feature.projectId,
          ownerId: feature.ownerId,
        });
      }
    }

    const allTickets: Ticket[] = [];
    for (const [pIdx, project] of projects.entries()) {
      const projectFeatures = features.filter(
        (f) => f.projectId === project.id,
      );
      const projectMembers = projectDefs[pIdx].members;
      const ticketCount = Math.floor(Math.random() * 15) + 20;

      const tickets = generateTickets(
        project.id,
        projectFeatures,
        projectMembers,
        ticketCount,
      );

      const ticketForProject = await this.prisma.ticket.createManyAndReturn({
        data: tickets,
      });

      allTickets.push(...ticketForProject);
    }

    if (allData) {
      const publishedPosts = posts.filter((p: any) => p.published);
      await this.prisma.postComment.createMany({
        data: Array.from({ length: 30 }).map(() => ({
          text: pickRandom(COMMENT_TEXTS),
          authorId: pickRandom(allUsers).id,
          parentPostId: pickRandom(publishedPosts).id,
        })),
      });
    }

    await this.prisma.ticketComment.createMany({
      data: Array.from({ length: Math.floor(Math.random() * 50) }).map(() => ({
        text: pickRandom(TICKET_COMMENTS),
        authorId: pickRandom(allUsers).id,
        parentTicketId: pickRandom(allTickets).id,
      })),
    });

    const duration = Date.now() - startTime;
    const yourOrgs = await this.prisma.orgMembers.count({
      where: { userId: userId },
    });
    const yourProjects = await this.prisma.projectContributor.count({
      where: { userId: userId },
    });

    return {
      success: true,
      message: 'Your demo environment is ready! 🎉',
      duration: `${duration}ms`,
      yourAccount: {
        id: userId,
        email: currentUser.email,
        organizations: yourOrgs,
        projects: yourProjects,
      },
      demoAccounts: {
        test: {
          email: testEmail,
          password: 'password123',
          name: testUser.profile?.name ?? 'Test User',
        },
        demo: {
          email: demoEmail,
          password: 'password123',
          name: demoUser.profile?.name ?? 'Demo User',
        },
        note: 'These accounts are also members of your organizations and projects',
      },
      created: {
        organizations: 5,
        posts: posts.length,
        projects: projects.length,
        features: features.length,
        tickets: allTickets.length,
        postComments: allData ? 20 : 0,
        ticketComments: 50,
      },

      quickLinks: projects.map((p) => ({
        project: p.title,
        urlid: p.urlid,
        yourRole: p.ownerId === userId ? 'OWNER' : 'CONTRIBUTOR',
        ticketsUrl: `/projects/${p.id}/tickets`,
      })),

      nextSteps: [
        'Login as test@gmail.com or demo@gmail.com to see collaborator view',
        'Try PATCH /projects/:projectId/tickets to rearrange tickets',
        'Create a new ticket via POST /projects/:projectId/tickets',
        'Check GET /demo/status anytime to see your demo data summary',
      ],
    };
  }

  @Delete('cleanup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cleanup(@GetUser('id') userId: string) {
    const testEmail = `test+${userId}@gmail.com`;
    const demoEmail = `demo+${userId}@gmail.com`;

    const testUser = await this.prisma.user.findUnique({
      where: { email: testEmail },
      select: { id: true },
    });
    const demoUser = await this.prisma.user.findUnique({
      where: { email: demoEmail },
      select: { id: true },
    });

    const userIds = [userId, testUser?.id, demoUser?.id].filter(
      Boolean,
    ) as string[];

    await this.prisma.$transaction(async (tx) => {
      await tx.ticketComment.deleteMany({
        where: { authorId: { in: userIds } },
      });
      await tx.postComment.deleteMany({ where: { authorId: { in: userIds } } });
      await tx.ticket.deleteMany({ where: { creatorId: { in: userIds } } });
      await tx.features.deleteMany({ where: { ownerId: { in: userIds } } });
      await tx.projectContributor.deleteMany({
        where: { userId: { in: userIds } },
      });
      await tx.project.deleteMany({ where: { ownerId: { in: userIds } } });
      await tx.post.deleteMany({ where: { authorId: { in: userIds } } });
      await tx.orgMembers.deleteMany({ where: { userId: { in: userIds } } });
      await tx.organization.deleteMany({ where: { ownerId: { in: userIds } } });

      if (testUser) await tx.user.delete({ where: { id: testUser.id } });
      if (demoUser) await tx.user.delete({ where: { id: demoUser.id } });
    });
  }
}
