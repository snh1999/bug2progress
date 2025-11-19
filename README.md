# bug2progress

bug2progress is a RESTful API aimed at building a backend for bugtracker application.

The repository for [frontend](https://github.com/snh1999/bug2progress-frontend).

### 🚀 Getting Started

1. Node.js (v20+), Docker and Docker Compose (for database/PostgreSQL) and [`bun`](https://bun.com/docs/installation), [`prisma`](https://www.prisma.io/docs/getting-started/quickstart) is required to run this project. Make sure there is [`node.js`](https://nodejs.org/en) and [`docker`](https://docs.docker.com/desktop/) is installed beforehand.

```bash
# to install bun
curl -fsSL https://bun.com/install | bash
```

2. Clone the repository.

```bash
git clone https://github.com/snh1999/bug2progress
cd bug2progress
bun install
```

3. Docker compose to manage database. [Note- make sure you check the `docker-compose.yml`]

```bash
docker compose up db -d
# or with podman
podman-compose up db -d
```

4. Setup the environment variables(`.env` for application and `.env.test` for tests), there is a sample `.env.sample` file provided.

5. Database Setup(make sure the database is running)

```bash
# Generate Prisma client
npx db:generate
# Run migrations
npx db:migrate
```

5. finally run the server

```bash
bun start:dev
```

6. The API will be available at http://localhost:8080/api/v1 (you can change the port in the `main.ts` file)
   To view swagger documentation, visit `http://localhost:8080/api` (given you have not changed the port in `main.ts`)

7. Other available scripts

```bash
# Development
bun start:debug      # Start in debug mode
bun start:prod       # Start production build

# Building
bun build            # Build the application
bun start            # Start built application

# Database
bun db:dev-deploy   # Deploy migrations to dev database
bun db:test-deploy  # Deploy migrations to test database
bun db:seed         # Seed database
bun db:generate      # Generate Prisma client
bun db:migrate   # Apply migrations


# Testing
bun test:e2e         # Run end-to-end tests

# Code Quality
bun lint             # Run ESLint
bun format           # Format code with Prettier
```

#### 🏗️ Entity Relationship Diagram and Architecture Overview

<img width="2166" alt="Image" src="https://github.com/user-attachments/assets/46fc1c18-6fa9-44fc-bf8a-cf988fe8c3b1" />
<img width="2166" alt="Image" src="https://github.com/user-attachments/assets/f38d1923-3648-43bf-b73c-7e82ce7d9fbb" />

#### 📁 Project Structure

```bash
src/
├── prisma/                 # Database configuration and helper methods
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                   # Handles user authentication with password change/reset and email service setup (Uses JWT token)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.constants.ts
│   ├── auth.module.ts
│   ├── types/                # DTOs and payload types
│   └── strategies/
│       └── jwt.strategy.ts
├── projects/               # CRUD operations with permission and member management for tickets and features
├── organizations/          # Optional organization management (takes permission management over from project owner/roles)
├── features/               # Optional Hierarchical organization of tickets
├── tickets/                # Comprehensive ticket management
├── post/                   # Common module for other modules to build on (e.g., comments, attachments, etc.)
├── comments/               # Commenting/discussion structure for other modules (via post)
├── users/                  # User profile and management (by admin/super user)
└── common/
    ├── config/             # cors and other configurations
    ├── decorators/         # Custom decorators (get user and roles)
    ├── guards/             # Custom guards (jwt and roles)
    ├── interceptors/       # Custom interceptors (exception handling, logging, response transformer)
    └──types/
prisma/                 # Database configuration
   ├── schema.prisma
   ├── migrations/
   └── seed.ts
app.module.ts           # Root module
main.ts                 # Application entry point
```

### Features

#### ✅ Implemented Features

- [x] Complete authentication system with JWT
- [x] Full CRUD operations for all entities
- [x] Role-based authorization system
- [x] Database relationships and constraints
- [x] Comprehensive error handling, Input validation and sanitization
- [x] API documentation with Swagger
- [x] rate limiting, cors setup
- [x] End to end testing

| Actions                 | Owner | Manager | Developer | Any User |
|-------------------------|-------|---------|-----------|----------|
| Create Project          | -     | -       | -         | ✅        |
| View Project            | ✅     | ✅       | ✅         | ❌        |
| Edit Project            | ✅     | ❌       | ❌         | ❌        |
| Delete Project          | ✅     | ❌       | ❌         | ⛔        |
| Invite to Project       | ✅     | ✅       | ✅         | ⛔        |
| Join Project            | -     | -       | -         | ✅        |
| Add Project Contributor | ✅     | ❌       | ❌         | ❌        |
| Remove Contributor      | ✅     | ❌       | ❌         | ❌        |
| Update Contributor Role | ✅     | ❌       | ❌         | ❌        |
| Create Feature          | ✅     | ✅       | ✅         | ❌        |
| View Feature            | ✅     | ✅       | ✅         | ❌        |
| Edit Feature            | ✅     | ❌       | ❌         | ❌        |
| Delete Feature          | ✅     | ❌       | ❌         | ❌        |
| Create Ticket           | ✅     | ✅       | ✅         | ❌        |
| View Ticket             | ✅     | ✅       | ✅         | ❌        |
| Edit Ticket             | ✅     | ✅       | ✅         | ❌        |
| Delete Ticket           | ✅     | ✅       | ✅         | ❌        |

#### 🎯 Future Enhancements

- [ ] Proper logging system
- [ ] File attachment handling
- [ ] Advanced reporting and analytics
- [ ] Caching layer (Redis)
- [ ] Database optimization

## API Documentation

It is better to use seeder to generate data (`pnpm run db:seed`) and run requests from [`http file`](requests.http) one by one should give proper idea on response types.
(I will be working on producing proper API documentation as soon as possible)

### Base Information

- Base URL: http://localhost:8080/api/v1
- Authentication: JWT Bearer Token
- Rate Limit: 100 requests per hour
- API Version: v1
- Swagger UI: http://localhost:8080/api (local development only)

#### Authentication

```http
POST   /auth/register               # Register
POST   /auth/login                  # Login
POST   /auth/forgot-password        # Forgot Password
POST   /auth/reset-password/{token} # Reset Password
POST   /auth/change-password        # Change Password (Auth Required 🔐)
```

#### Users (Auth Required 🔐)

```http
GET    /users              # Get all users (admin)
GET    /users/me           # Get profile of Logged in user
PATCH  /users/me           # Update user profile/user
GET    /users/:id          # Get user by ID/username (active and public profile)
DELETE /users/me           # Delete current user
DELETE /users/:id          # Delete user account
```

#### Projects (Auth Required 🔐)

```http
GET    /projects           # Get all projects
GET    /projects/:id       # Get project by ID
POST   /projects           # Create project
PATCH  /projects/:id       # Update project
DELETE /projects/:id       # Delete project

GET    /projects/:id/contributors       # Get project contributors
POST   /projects/:id/contributors       # Add project contributor
POST   /projects/:id/:inviteCode/join   # Join via invite code
PATCH  /projects/:id/contributors       # Update project contributor role
DELETE /projects/:id/contributors         # Remove project contributor
```

#### Organizations (Auth Required 🔐)

```http
GET    /organizations           # Get all organizations (Auth not required)
GET    /organizations/:id       # Get organization by ID
POST   /organizations           # Create organization
PATCH  /organizations/:id       # Update organization
DELETE /organizations/:id       # Delete organization
```

#### Features (Auth Required 🔐)

Only visible to project members

```http
GET    /projects/:id/features           # Get all features
GET    /projects/:id/features/:id       # Get feature by ID
POST   /projects/:id/features           # Create feature
PATCH  /projects/:id/features/:id       # Update feature
DELETE /projects/:id/features/:id       # Delete feature
```

#### Tickets (Auth Required 🔐)

Only visible to project members

```http
GET    /projects/:id/tickets           # Get all tickets (Query params allowed)
GET    /projects/:id/tickets/:id       # Get ticket by ID
POST   /projects/:id/tickets           # Create ticket
PATCH   /projects/:id/tickets          # Batch update ticket
PATCH  /projects/:id/tickets/:id       # Update ticket
DELETE /projects/:id/tickets/:id       # Delete ticket
```

#### Posts (Auth Required 🔐)

```http
GET    /projects/:id/tickets/:id/posts           # Get all posts
GET    /projects/:id/tickets/:id/posts/:id       # Get post by ID
POST   /projects/:id/tickets/:id/posts           # Create post
PATCH  /projects/:id/tickets/:id/posts/:id       # Update post
DELETE /projects/:id/tickets/:id/posts/:id       # Delete post
```

#### Comments (Auth Required 🔐)

```http
GET    /projects/:id/tickets/:id/comments           # Get all comments
GET    /projects/:id/tickets/:id/comments/:id       # Get comment by ID
POST   /projects/:id/tickets/:id/comments           # Create comment
PATCH  /projects/:id/tickets/:id/comments/:id       # Update comment
DELETE /projects/:id/tickets/:id/comments/:id       # Delete comment
```
