import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        joinedAt: true,
        updatedAt: true,
        profile: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });
  }

  async getAllOrganizations() {
    return this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        urlid: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            profile: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            project: true,
            post: true,
          },
        },
      },
    });
  }

  async getAllProjects() {
    return this.prisma.project.findMany({
      select: {
        id: true,
        urlid: true,
        title: true,
        summary: true,
        status: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            profile: {
              select: {
                username: true,
              },
            },
          },
        },
        organization: {
          select: {
            name: true,
            urlid: true,
          },
        },
        _count: {
          select: {
            ticket: true,
            members: true,
          },
        },
      },
    });
  }

  async getAllTickets() {
    return this.prisma.ticket.findMany({
      select: {
        id: true,
        title: true,
        ticketStatus: true,
        ticketPriority: true,
        ticketType: true,
        position: true,
        createdAt: true,
        dueAt: true,
        project: {
          select: {
            title: true,
            urlid: true,
          },
        },
        feature: {
          select: {
            title: true,
          },
        },
        creator: {
          select: {
            profile: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            ticketComment: true,
          },
        },
      },
    });
  }

  async getAllFeatures() {
    return this.prisma.features.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        featureType: true,
        isPublic: true,
        project: {
          select: {
            title: true,
            urlid: true,
          },
        },
        owner: {
          select: {
            profile: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            ticket: true,
          },
        },
      },
    });
  }

  async getAllPosts() {
    return this.prisma.post.findMany({
      select: {
        id: true,
        title: true,
        published: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            profile: {
              select: {
                username: true,
              },
            },
          },
        },
        organization: {
          select: {
            name: true,
            urlid: true,
          },
        },
        _count: {
          select: {
            postComment: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [userCount, orgCount, projectCount, ticketCount, featureCount, postCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.organization.count(),
        this.prisma.project.count(),
        this.prisma.ticket.count(),
        this.prisma.features.count(),
        this.prisma.post.count(),
      ]);

    return {
      users: userCount,
      organizations: orgCount,
      projects: projectCount,
      tickets: ticketCount,
      features: featureCount,
      posts: postCount,
    };
  }
}