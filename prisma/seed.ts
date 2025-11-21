import {
  PrismaClient,
  Role,
  MemberType,
  ProjectRole,
  ProjectStatus,
  FeatureType,
  TicketType,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';

import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (in reverse dependency order)
  await prisma.ticketComment.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.features.deleteMany();
  await prisma.projectContributor.deleteMany();
  await prisma.project.deleteMany();
  await prisma.post.deleteMany();
  await prisma.orgMembers.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await argon.hash('password123');

  // Create Users
  // const admin =
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          name: 'Admin User',
          username: 'admin',
          bio: 'System Administrator',
          country: 'USA',
          photo: 'https://via.placeholder.com/150/admin',
        },
      },
    },
    include: { profile: true },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'John Doe',
          username: 'johndoe',
          bio: 'Full Stack Developer with 5 years experience',
          country: 'Canada',
          birthday: new Date('1990-05-15'),
          photo: 'https://via.placeholder.com/150/john',
        },
      },
    },
    include: { profile: true },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Jane Smith',
          username: 'janesmith',
          bio: 'UI/UX Designer and Frontend Developer',
          country: 'UK',
          birthday: new Date('1992-08-20'),
          photo: 'https://via.placeholder.com/150/jane',
        },
      },
    },
    include: { profile: true },
  });

  const mike = await prisma.user.create({
    data: {
      email: 'mike@example.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Mike Johnson',
          username: 'mikej',
          bio: 'DevOps Engineer and Backend Specialist',
          country: 'Australia',
          birthday: new Date('1988-12-03'),
          photo: 'https://via.placeholder.com/150/mike',
        },
      },
    },
    include: { profile: true },
  });

  console.log('✅ Created users');

  // Create Organizations
  const techCorp = await prisma.organization.create({
    data: {
      name: 'TechCorp Solutions',
      description: 'Leading software development company',
      urlid: 'techcorp',
      updateLog: 'Initial setup',
      ownerId: john.id,
      members: {
        create: [
          { userId: john.id, memberType: MemberType.ADMIN },
          { userId: jane.id, memberType: MemberType.MODERATOR },
          { userId: mike.id, memberType: MemberType.MEMBER },
        ],
      },
    },
  });

  // const startupHub =
  await prisma.organization.create({
    data: {
      name: 'Startup Hub',
      description: 'Innovation and entrepreneurship community',
      urlid: 'startuphub',
      updateLog: 'Community launch',
      ownerId: jane.id,
      members: {
        create: [
          { userId: jane.id, memberType: MemberType.ADMIN },
          { userId: mike.id, memberType: MemberType.MODERATOR },
        ],
      },
    },
  });

  console.log('✅ Created organizations');

  // Create Posts (needed for projects)
  const post1 = await prisma.post.create({
    data: {
      title: 'Bug Tracker Project Announcement',
      summary: 'Introducing our new bug tracking system',
      slug: 'bug-tracker-announcement',
      postContent:
        'We are excited to announce our comprehensive bug tracking system that will help teams manage projects efficiently...',
      published: true,
      authorId: john.id,
      organizationId: techCorp.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'E-commerce Platform Development',
      summary: 'Building a scalable e-commerce solution',
      slug: 'ecommerce-platform',
      postContent:
        'Our team is developing a modern e-commerce platform with advanced features...',
      published: true,
      authorId: jane.id,
      organizationId: techCorp.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Mobile App Development',
      summary: 'Cross-platform mobile application',
      slug: 'mobile-app-dev',
      postContent:
        'Developing a React Native mobile application for task management...',
      published: false,
      authorId: mike.id,
    },
  });

  console.log('✅ Created posts');

  // Create Projects
  const bugTracker = await prisma.project.create({
    data: {
      title: 'Bug Tracker System',
      summary: 'Comprehensive bug tracking and project management system',
      urlid: 'bug-tracker',
      status: ProjectStatus.IN_DEVELOPMENT,
      isPublic: true,
      ownerId: john.id,
      organizationId: techCorp.id,
      basePostId: post1.id,
      members: {
        create: [
          { userId: john.id, role: ProjectRole.MANAGER },
          { userId: jane.id, role: ProjectRole.LEAD },
          { userId: mike.id, role: ProjectRole.DEVELOPER },
        ],
      },
    },
  });

  const ecommercePlatform = await prisma.project.create({
    data: {
      title: 'E-commerce Platform',
      summary: 'Modern scalable e-commerce solution with advanced features',
      urlid: 'ecommerce-platform',
      status: ProjectStatus.PROPOSED,
      isPublic: true,
      ownerId: jane.id,
      organizationId: techCorp.id,
      basePostId: post2.id,
      members: {
        create: [
          { userId: jane.id, role: ProjectRole.MANAGER },
          { userId: mike.id, role: ProjectRole.DEVELOPER },
        ],
      },
    },
  });

  // const mobileApp =
  await prisma.project.create({
    data: {
      title: 'Task Manager Mobile App',
      summary: 'Cross-platform mobile application for task management',
      urlid: 'mobile-task-app',
      status: ProjectStatus.ACTIVE,
      isPublic: false,
      ownerId: mike.id,
      basePostId: post3.id,
      members: {
        create: [
          { userId: mike.id, role: ProjectRole.MANAGER },
          { userId: john.id, role: ProjectRole.DEVELOPER },
        ],
      },
    },
  });

  console.log('✅ Created projects');

  // Create Features
  const authFeature = await prisma.features.create({
    data: {
      title: 'User Authentication',
      description:
        'Implement JWT-based authentication system with role-based access control',
      necessaryLinks: [
        'https://jwt.io/',
        'https://docs.nestjs.com/security/authentication',
      ],
      process:
        '1. Setup JWT strategy\n2. Create auth guards\n3. Implement role-based access\n4. Add password reset functionality',
      featureType: FeatureType.ACTIVE,
      projectId: bugTracker.id,
      ownerId: john.id,
    },
  });

  const ticketFeature = await prisma.features.create({
    data: {
      title: 'Ticket Management',
      description: 'Complete ticket lifecycle management with multiple views',
      necessaryLinks: ['https://react-beautiful-dnd.org/'],
      process:
        '1. Create ticket CRUD operations\n2. Implement Kanban board\n3. Add calendar view\n4. Enable drag-and-drop',
      featureType: FeatureType.ACTIVE,
      projectId: bugTracker.id,
      ownerId: jane.id,
    },
  });

  const paymentFeature = await prisma.features.create({
    data: {
      title: 'Payment Integration',
      description: 'Stripe payment gateway integration',
      necessaryLinks: ['https://stripe.com/docs'],
      process:
        '1. Setup Stripe account\n2. Implement payment flows\n3. Handle webhooks\n4. Add subscription management',
      featureType: FeatureType.PROPOSED,
      projectId: ecommercePlatform.id,
      ownerId: jane.id,
    },
  });

  console.log('✅ Created features');

  // Create Tickets
  const tickets = [
    {
      title: 'Setup JWT Authentication',
      description:
        'Implement JWT strategy and auth guards for secure API access',
      ticketType: TicketType.FEATURE,
      ticketPriority: TicketPriority.HIGH,
      ticketStatus: TicketStatus.IN_PROGRESS,
      position: 1,
      projectId: bugTracker.id,
      featureId: authFeature.id,
      creatorId: john.id,
      assignedContributorId: john.id,
      dueAt: new Date('2024-02-15'),
    },
    {
      title: 'Fix password validation bug',
      description:
        'Password validation is not working correctly on registration form',
      ticketType: TicketType.BUG,
      ticketPriority: TicketPriority.CRITICAL,
      ticketStatus: TicketStatus.TODO,
      position: 2,
      projectId: bugTracker.id,
      featureId: authFeature.id,
      creatorId: jane.id,
      assignedContributorId: mike.id,
      dueAt: new Date('2024-01-30'),
    },
    {
      title: 'Create Kanban Board Component',
      description: 'Build drag-and-drop Kanban board for ticket management',
      ticketType: TicketType.FEATURE,
      ticketPriority: TicketPriority.MEDIUM,
      ticketStatus: TicketStatus.BACKLOG,
      position: 3,
      projectId: bugTracker.id,
      featureId: ticketFeature.id,
      creatorId: jane.id,
      assignedContributorId: jane.id,
      dueAt: new Date('2024-02-28'),
    },
    {
      title: 'Database optimization',
      description: 'Optimize database queries for better performance',
      ticketType: TicketType.TECH_DEBT,
      ticketPriority: TicketPriority.LOW,
      ticketStatus: TicketStatus.DONE,
      position: 4,
      projectId: bugTracker.id,
      creatorId: mike.id,
      assignedContributorId: mike.id,
      dueAt: new Date('2024-01-20'),
      verifierId: john.id,
      verifiedAt: new Date('2024-01-21'),
    },
    {
      title: 'Setup Stripe Payment Gateway',
      description: 'Integrate Stripe for handling payments and subscriptions',
      ticketType: TicketType.EPIC,
      ticketPriority: TicketPriority.HIGH,
      ticketStatus: TicketStatus.BACKLOG,
      position: 1,
      projectId: ecommercePlatform.id,
      featureId: paymentFeature.id,
      creatorId: jane.id,
      dueAt: new Date('2024-03-15'),
    },
  ];

  for (const ticketData of tickets) {
    await prisma.ticket.create({ data: ticketData });
  }

  console.log('✅ Created tickets');

  // Create Additional Posts
  await prisma.post.create({
    data: {
      title: 'Development Best Practices',
      summary: 'Guidelines for clean code and development workflow',
      slug: 'dev-best-practices',
      postContent:
        'Here are our recommended best practices for development: 1. Write clean, readable code...',
      published: true,
      authorId: mike.id,
      organizationId: techCorp.id,
      refProjectId: bugTracker.id,
    },
  });

  // Create Post Comments
  await prisma.postComment.create({
    data: {
      text: 'Great post! Looking forward to seeing this project in action.',
      authorId: jane.id,
      parentPostId: post1.id,
    },
  });

  await prisma.postComment.create({
    data: {
      text: 'The architecture looks solid. When do we start development?',
      authorId: mike.id,
      parentPostId: post1.id,
    },
  });

  console.log('✅ Created post comments');

  console.log('🌱 Seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log(`- ${await prisma.user.count()} Users`);
  console.log(`- ${await prisma.organization.count()} Organizations`);
  console.log(`- ${await prisma.project.count()} Projects`);
  console.log(`- ${await prisma.features.count()} Features`);
  console.log(`- ${await prisma.ticket.count()} Tickets`);
  console.log(`- ${await prisma.post.count()} Posts`);
  console.log(`- ${await prisma.postComment.count()} Comments`);

  console.log('\n🔑 Test Accounts:');
  console.log('Admin: admin@example.com / password123');
  console.log('John: john@example.com / password123');
  console.log('Jane: jane@example.com / password123');
  console.log('Mike: mike@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
