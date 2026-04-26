import {
  MemberType,
  ProjectRole,
  TicketPriority,
  TicketStatus,
  TicketType,
  User,
  Organization,
  ProjectStatus,
  Post
} from '@prisma/client';

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

export function generateTickets(
  projectId: string,
  features: { id: string; ownerId: string }[],
  members: { userId: string; role: ProjectRole }[],
  count: number = 24,
) {
  const tickets = [];
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 28);

  const types = Object.values(TicketType);
  const priorities = Object.values(TicketPriority);
  const statuses = Object.values(TicketStatus);

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const priority = pickRandom(priorities);
    const status = pickRandom(statuses);
    const feature = features.length > 0 ? pickRandom(features) : null;
    const creator = members[i % members.length];
    const assignee = Math.random() > 0.2 ? pickRandom(members) : null;
    const verifier =
      status === TicketStatus.DONE && Math.random() > 0.5
        ? pickRandom(members)
        : null;
    const dueAt = randomDate(startDate, endDate);

    const titles = TICKET_TITLES[type];
    const title = `${titles[i % titles.length]}${i >= titles.length ? ` #${Math.floor(i / titles.length) + 1}` : ''}`;

    tickets.push({
      title,
      description: `This ticket covers the implementation of "${title}".\n\n## Acceptance Criteria\n- [ ] Requirement analysis complete\n- [ ] Implementation done\n- [ ] Unit tests passing\n- [ ] Code review approved\n- [ ] Deployed to staging\n\n## Notes\nPriority: ${priority} | Status: ${status}\nCreated by: ${creator.userId.slice(0, 8)}...`,
      ticketType: type,
      ticketPriority: priority,
      ticketStatus: status,
      position: i + 1,
      projectId,
      featureId: feature?.id ?? null,
      creatorId: creator.userId,
      assignedContributorId: assignee?.userId ?? null,
      verifierId: verifier?.userId ?? null,
      verifiedAt: verifier
        ? randomDate(dueAt, new Date(dueAt.getTime() + 86400000 * 3))
        : null,
      dueAt,
    });
  }

  return tickets;
}

export const TICKET_TITLES: Record<TicketType, string[]> = {
  [TicketType.FEATURE]: [
    'Implement dark mode toggle',
    'Add export to CSV functionality',
    'Create user onboarding flow',
    'Build real-time notifications',
    'Add search filters',
    'Implement drag-and-drop sorting',
    'Create dashboard widgets',
    'Add bulk operations',
    'Build analytics charts',
    'Implement SSO login',
    'Add file attachments',
    'Create email templates',
    'Build API rate limiting',
    'Add webhook support',
    'Implement caching layer',
    'Create audit logs',
    'Add multi-language support',
    'Build data migration tool',
    'Implement soft deletes',
    'Add custom fields',
    'Create report builder',
    'Build import wizard',
    'Add keyboard shortcuts',
    'Implement auto-save drafts',
  ],
  [TicketType.BUG]: [
    'Fix login redirect loop',
    'Resolve memory leak in dashboard',
    'Fix date picker timezone bug',
    'Correct permission check logic',
    'Fix broken image uploads',
    'Resolve CORS errors',
    'Fix pagination total count',
    'Correct email formatting',
    'Fix mobile menu overlap',
    'Resolve session timeout issue',
    'Fix search index stale data',
    'Correct role assignment',
    'Fix notification duplicates',
    'Resolve WebSocket reconnect',
    'Fix CSV encoding issue',
    'Correct form validation errors',
    'Fix print stylesheet',
    'Resolve cache invalidation',
    'Fix sorting arrow direction',
    'Correct avatar fallback display',
    'Fix modal focus trap',
    'Resolve slow query on projects list',
    'Fix breadcrumb navigation',
    'Correct i18n fallback strings',
  ],
  [TicketType.TECH_DEBT]: [
    'Refactor authentication middleware',
    'Extract shared components',
    'Upgrade dependency versions',
    'Optimize database indexes',
    'Remove dead code paths',
    'Standardize error handling',
    'Add integration tests coverage',
    'Refactor state management',
    'Document API endpoints',
    'Consolidate utility functions',
    'Add TypeScript strict mode',
    'Implement proper logging',
    'Refactor email service',
    'Add database seeding for tests',
    'Improve CI/CD pipeline',
    'Standardize naming conventions',
    'Add performance monitoring',
    'Refactor ORM queries',
    'Implement request validation',
    'Add health check endpoints',
    'Migrate to new UI library',
    'Refactor WebSocket handlers',
    'Add backup automation',
    'Improve error tracking',
  ],
  [TicketType.EPIC]: [
    'User Management Overhaul',
    'Payment System Integration',
    'Real-time Collaboration Suite',
    'Advanced Reporting Module',
    'Multi-tenant Architecture',
    'Mobile Application Launch',
    'Performance Optimization Initiative',
    'Security Audit & Hardening',
    'Third-party Integrations Hub',
    'Data Pipeline Modernization',
    'Accessibility Compliance',
    'International Expansion Support',
    'AI-powered Recommendations',
    'Offline Mode Support',
    'Custom Workflow Builder',
    'Advanced Analytics Platform',
    'Enterprise SSO & SCIM',
    'API Versioning Strategy',
    'Microservices Migration',
    'Customer Portal Redesign',
    'Event-driven Architecture',
    'Disaster Recovery System',
    'Compliance & GDPR Suite',
    'Developer Experience Improvement',
  ],
  ENHANCEMENT: [],
  SPIKE: [],
  STORY: [],
  TASK: [],
  SUPPORT: [],
  TEST: [],
} as const;

export const FEATURE_TITLES = [
  'User Authentication & Authorization',
  'Dashboard & Analytics',
  'Project Management Core',
  'Ticket Lifecycle Management',
  'Notification System',
  'Reporting & Exports',
  'Team Collaboration Tools',
  'API & Webhooks',
  'Performance Monitoring',
  'Security & Compliance',
  'Database Optimization',
  'CI/CD Integration',
  'Documentation Generator',
  'Testing Framework',
];


export const COMMENT_TEXTS = [
  'Great initiative! Looking forward to the implementation.',
  'Should we consider edge cases for mobile users?',
  'The timeline seems aggressive. Can we break this into phases?',
  'I can help with the backend implementation.',
  'We need to update the documentation before release.',
  'Has this been tested with the new design system?',
  'Love the approach! Clean architecture.',
  'We should schedule a review meeting next week.',
  'Can we add monitoring for this feature?',
  'The API contract looks solid. Approved from my side.',
  'Need to consider backward compatibility here.',
  'Performance impact seems minimal. Good work!',
  'Should we A/B test this before full rollout?',
  'Security review passed. Ready for staging.',
  'Customer feedback indicates this is a high priority.',
];

export const TICKET_COMMENTS = [
  'Updated the implementation based on review feedback.',
  'Found a potential race condition in the async handler.',
  'Added unit tests for the edge cases.',
  'Ready for QA testing.',
  'Fixed the CSS issue on mobile viewports.',
  'Database migration applied successfully.',
  'Need to update the environment variables.',
  'Performance improved by 40% after optimization.',
  'Rebased onto main, no conflicts.',
  'Added error handling for network failures.',
  'Documentation updated in the wiki.',
  'Screenshots attached for UI review.',
  'Verified fix on staging environment.',
  'Need product team approval before merge.',
  'Refactored to use the new utility function.',
  'CI pipeline is green. Ready to merge.',
  'Customer confirmed the fix resolves their issue.',
  'Added logging for debugging purposes.',
  'Rollback plan documented in case of issues.',
  'Integration tests passing locally.',
];


export function getProjectData(users: User[], posts: Post[] ){
  const [currentUser, testUser, demoUser] = users;
  return [
    {
      title: 'Bug Tracker System',
      summary:
        'Comprehensive bug tracking and project management system with Kanban boards and real-time updates',
      urlid: 'bug-tracker',
      status: ProjectStatus.ACTIVE,
      isPublic: true,
      ownerId: currentUser.id,
      postId: posts[0].id,
      members: [
        { userId: currentUser.id, role: ProjectRole.MANAGER },
        { userId: testUser.id, role: ProjectRole.LEAD },
        { userId: demoUser.id, role: ProjectRole.DEVELOPER },
      ],
    },
    {
      title: 'E-commerce Platform',
      summary:
        'Modern scalable e-commerce solution with Stripe payments, inventory management, and admin dashboard',
      urlid: 'ecommerce-platform',
      status: ProjectStatus.IN_DEVELOPMENT,
      isPublic: true,
      ownerId: testUser.id,
      postId: posts[1].id,
      members: [
        { userId: testUser.id, role: ProjectRole.MANAGER },
        { userId: demoUser.id, role: ProjectRole.DEVELOPER },
        { userId: currentUser.id, role: ProjectRole.LEAD },
      ],
    },
    {
      title: 'Task Manager Mobile App',
      summary:
        'Cross-platform React Native application for personal and team task management with offline sync',
      urlid: 'mobile-task-app',
      status: ProjectStatus.ACTIVE,
      isPublic: false,
      ownerId: demoUser.id,
      postId: posts[4].id,
      members: [
        { userId: demoUser.id, role: ProjectRole.MANAGER },
        { userId: currentUser.id, role: ProjectRole.DEVELOPER },
        { userId: testUser.id, role: ProjectRole.LEAD },
      ],
    },
    {
      title: 'Analytics Dashboard',
      summary:
        'Real-time business intelligence dashboard with custom widgets, drill-down reporting, and alerts',
      urlid: 'analytics-dashboard',
      status: ProjectStatus.PROPOSED,
      isPublic: true,
      ownerId: currentUser.id,
      postId: posts[5].id,
      members: users.map((u) => ({
        userId: u.id,
        role:
          u.id === currentUser.id
            ? ProjectRole.MANAGER
            : pickRandom([ProjectRole.LEAD, ProjectRole.DEVELOPER]),
      })),
    },
    {
      title: 'API Gateway Modernization',
      summary:
        'Migrating legacy REST APIs to GraphQL federation with improved rate limiting, caching, and monitoring',
      urlid: 'api-gateway',
      status: ProjectStatus.IN_DEVELOPMENT,
      isPublic: false,
      ownerId: demoUser.id,
      postId: posts[3].id,
      members: [
        { userId: demoUser.id, role: ProjectRole.MANAGER },
        { userId: currentUser.id, role: ProjectRole.LEAD },
        { userId: testUser.id, role: ProjectRole.DEVELOPER },
      ],
    },
  ];
}

export function getOrganizationData(userId: string, users: User[]) {
  if(users.length <3) {
    return [];
  }

  return [
    {
      name: 'Demo Corp',
      description: 'Your primary demo organization with full project suite',
      urlid: 'demo-corp',
      updateLog: 'Org created',
      ownerId: userId,
      members: {
        create: users.map((u, i) => ({
          userId: u.id,
          memberType:
            i === 0
              ? MemberType.ADMIN
              : pickRandom([MemberType.MODERATOR, MemberType.MEMBER]),
        })),
      },
    },
    {
      name: 'Beta Labs',
      description: 'Experimental projects and R&D initiatives',
      urlid: 'beta-labs',
      updateLog: 'Org created',
      ownerId: users[1].id,
      members: {
        create: users.map((u, i) => ({
          userId: u.id,
          memberType:
            i === 1
              ? MemberType.ADMIN
              : pickRandom([MemberType.MODERATOR, MemberType.MEMBER]),
        })),
      },
    },
    {
      name: 'Fake Digital',
      description: 'Digital transformation and consulting projects',
      urlid: 'gamma-digital',
      updateLog: 'Org created',
      ownerId: users[2].id,
      members: {
        create: users.map((u, i) => ({
          userId: u.id,
          memberType:
            i === 2
              ? MemberType.ADMIN
              : pickRandom([MemberType.MODERATOR, MemberType.MEMBER]),
        })),
      },
    },
    {
      name: 'Delta Systems',
      description: 'Infrastructure and DevOps focused organization',
      urlid: 'delta-systems',
      ownerId: userId,
      updateLog: 'Org created',
      members: {
        create: [
          { userId: userId, memberType: MemberType.ADMIN },
          { userId: users[1].id, memberType: MemberType.MEMBER },
        ],
      },
    },
    {
      name: 'Epsilon Design',
      description: 'UI/UX and frontend-focused projects',
      urlid: 'epsilon-design',
      updateLog: 'Org created',
      ownerId: users[1].id,
      members: {
        create: users
          .filter((user) => user.id !== users[1].id)
          .map((u) => ({
            userId: u.id,
            memberType: MemberType.MEMBER,
          })),
      },
    },
  ];
}

export function getPostData(currentUserId: string, users: User[], orgs: Organization[]) {
  return [
    {
      title: 'Q1 Product Roadmap Overview',
      summary: 'Overview of upcoming features and milestones for Q1',
      slug: 'q1-roadmap',
      postContent: `## Q1 Roadmap\n\nWe have exciting features planned:\n- Real-time collaboration\n- Advanced analytics\n- Mobile app beta\n- GraphQL API migration\n\nStay tuned for weekly updates!`,
      published: true,
      authorId: currentUserId,
      organizationId: pickRandom(orgs).id,
    },
    {
      title: 'New Team Member Onboarding Guide',
      summary: 'Step-by-step guide for new team members joining the platform',
      slug: 'onboarding-guide',
      postContent: `## Welcome to the Team!\n\n1. Set up your development environment\n2. Join Slack channels (#dev, #design, #general)\n3. Complete security training module\n4. Schedule 1:1s with your buddy\n5. Pick your first "good first issue" ticket`,
      published: true,
      authorId: users[1].id,
      organizationId: pickRandom(orgs).id,
    },
    {
      title: 'System Maintenance Schedule',
      summary: 'Scheduled maintenance windows for March and April',
      slug: 'maintenance-march',
      postContent: `## Maintenance Schedule\n\n- **March 10**: Database upgrades (2-hour window)\n- **March 17**: CDN migration to edge locations\n- **March 24**: Security patches and dependency updates\n- **April 2**: Load balancer configuration changes`,
      published: true,
      authorId: users[2].id,
      organizationId: pickRandom(orgs).id,
    },
    {
      title: 'API Deprecation Notice v1.0',
      summary:
        'Legacy API v1.0 will be deprecated in 90 days — action required',
      slug: 'api-deprecation',
      postContent: `## Action Required by June 1st\n\nPlease migrate to API v2.0 before the sunset date.\n\n**Migration guide**: [https://docs.example.com/migrate](https://docs.example.com/migrate)\n**Support channel**: #api-migration on Slack`,
      published: true,
      authorId: currentUserId,
      organizationId: pickRandom(orgs).id,
    },
    {
      title: 'Security Best Practices Update',
      summary: 'Updated security requirements and best practices for all teams',
      slug: 'security-update',
      postContent: `## Security Updates Q1\n\n- Enable 2FA on all accounts (mandatory by March 30)\n- Rotate API keys quarterly\n- Review access logs weekly\n- New requirements for SOC2 compliance`,
      published: false,
      authorId: users[1].id,
    },
    {
      title: 'Performance Benchmarks Q1',
      summary: 'Q1 performance metrics and benchmarks across all services',
      slug: 'perf-benchmarks',
      postContent: `## Benchmarks\n\n| Service | p50 | p95 | p99 |\n|---------|-----|-----|-----|\n| API | 12ms | 45ms | 120ms |\n| Dashboard | 800ms | 1.2s | 2.1s |\n| Search | 25ms | 80ms | 200ms |\n\nAvailability: **99.97%**`,
      published: true,
      authorId: users[2].id,
      organizationId: pickRandom(orgs).id,
    },
    {
      title: 'Customer Feedback Summary',
      summary: 'Summary of customer feedback from Q1 NPS surveys',
      slug: 'customer-feedback',
      postContent: `## Feedback Highlights\n\n- "Love the new dashboard!" ⭐ 87%\n- "Need better mobile support" 📱 62%\n- "Export feature is essential" 📊 78%\n- "Search could be faster" 🔍 45%\n\nNPS Score: **+42** (up from +35)`,
      published: true,
      authorId: users[1].id,
      organizationId: pickRandom(orgs).id,
    },
    {
      title: 'Release Notes v2.4.0',
      summary: 'New features, improvements, and bug fixes in v2.4.0',
      slug: 'release-2-4-0',
      postContent: `## What's New in v2.4.0\n\n✨ **Features**\n- Dark mode support\n- CSV/Excel exports\n- Keyboard shortcuts (press ? to see all)\n\n🐛 **Fixes**\n- Fixed memory leak in dashboard\n- Corrected timezone handling\n- 13 more bug fixes\n\n[Full changelog](https://github.com/example/changelog)`,
      published: true,
      authorId: currentUserId,
      organizationId: pickRandom(orgs).id,
    },
  ];
}
