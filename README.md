# bug2progress

bug2progress is a RESTful API aimed at building a backend for bugtracker application.

The repository for [frontend](https://github.com/snh1999/bug2progress-frontend).

### 🚀 Getting Started

1. Node.js (v20+), Docker and Docker Compose (for database/PostgreSQL) and [`pnpm`](https://pnpm.io/installation), [`prisma`](https://www.prisma.io/docs/getting-started/quickstart) is required to run this project. Make sure there is [`node.js`](https://nodejs.org/en) and [`docker`](https://docs.docker.com/desktop/) is installed beforehand.

```bash
# to install pnpm
npm install -g pnpm
```

2. Clone the repository.

```bash
git clone https://github.com/snh1999/bug2progress
cd bug2progress
pnpm install
```

3. Docker compose to manage database. [Note- make sure you check the `docker-compose.yml`]

```bash
docker compose up db -d
```

4. Setup the environment variables, there is a sample `.env.sample` file provided.

5. Database Setup(make sure the database is running)

```bash
# Generate Prisma client
npx prisma generate
# Run migrations
npx prisma migrate dev
```

5. finally run the server

```bash
pnpm run start:dev
```

6. The API will be available at http://localhost:8080/api/v1 (you can change the port in the `main.ts` file)
   To view swagger documentation, visit `http://localhost:8080/api` (given you have not changed the port in `main.ts`)

7. Other available scripts

```bash
# Development
pnpm run start:debug      # Start in debug mode
pnpm run start:prod       # Start production build

# Building
pnpm run build            # Build the application
pnpm run start            # Start built application

# Database
pnpm run prisma:dev-deploy   # Deploy migrations to dev database
pnpm run prisma:test-deploy  # Deploy migrations to test database

npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Apply migrations

# Testing
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
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

## API Documentation

### Base Information

- Base URL: http://localhost:8080/api/v1
- Authentication: JWT Bearer Token
- Rate Limit: 100 requests per hour
- API Version: v1
- Swagger UI: http://localhost:8080/api (local development only)

### Auth (click to expand)

Authentication

```http
POST   /auth/register               # Register
POST   /auth/login                  # Login
POST   /auth/forgot-password        # Forgot Password
POST   /auth/reset-password/{token} # Reset Password
POST   /auth/change-password          # Change Password
```

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Register User</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /register</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "statusCode": 201,
  "message": "Logged In successfully",
  "data": {
    "token": "ey...........ey........OypL......"
  }
}
</code>
</pre>

`bio`, `country`, and `photo` are optional fields.

<b style="font-weight: bold; font-size: 1.05em;">Response:</b>

<pre>
<code>{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "profile": {
        "name": "John Doe",
        "username": "johndoe"
      }
    },
    "token": "jwt-token"
  }
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Login User</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /login</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "email": "user@example.com",
  "password": "securepass123"
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Forgot Password</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /forgot-password</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "email": "user@example.com"
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Reset Password</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /reset-password/:token</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "password": "newpassword123"
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Change Password (🔐) </summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /change-password</code>
</pre>

<br>

<br><br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "oldPassword": "currentpass",
  "newPassword": "newpass123"
}
</code>
</pre>

</details>

#### Users (Auth Required 🔐)

```http
GET    /users              # Get all users (admin)
GET    /users/me           # Get profile of Logged in user
PATCH  /users/me           # Update user profile/user
GET    /users/:id          # Get user by ID/username (active and public profile)
DELETE /users/me           # Delete current user
DELETE /users/:id          # Delete user account

```

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Get All Users (Admin👑)</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>GET /user</code>
</pre>

<br>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Get My Profile</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>GET /user/me</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Response:</b>

<pre>
<code>{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "name": "John Doe",
      "username": "johndoe",
      "bio": "Software developer",
      "country": "USA",
      "photo": "profile-url.jpg"
    }
  }
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Update My Profile</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>PATCH /user/me</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "name": "Jane Doe",
  "bio": "Senior Developer",
  "country": "Canada"
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">View Public Profile</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>GET /user/:username</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Public</b>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Delete My Account</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /user/me/delete</code>
</pre>

<br>

<b style="font-weight: bold; font-size: 1.05em;">Request Body:</b>

<pre>
<code>{
  "password": "currentpassword"
}
</code>
</pre>

</details>

<details close>
<summary style="font-weight: bold; font-size: 1.1em">Deactivate My Account</summary>
<br>

<b style="font-weight: bold; font-size: 1.05em;">Endpoint:</b>

<pre>
<code>POST /user/me/deactivate</code>
</pre>

<br>

</details>

🔌 API Endpoints

Projects
httpGET /projects # Get user's projects
POST /projects # Create new project
GET /projects/:id # Get project details
PUT /projects/:id # Update project
DELETE /projects/:id # Delete project
POST /projects/:id/members # Add project member
DELETE /projects/:id/members/:userId # Remove member
PUT /projects/:id/members/:userId # Update member role
Tickets
httpGET /projects/:id/tickets # List project tickets
POST /projects/:id/tickets # Create new ticket
GET /tickets/:id # Get ticket details
PUT /tickets/:id # Update ticket
DELETE /tickets/:id # Delete ticket
GET /tickets/:id/comments # Get ticket comments
POST /tickets/:id/comments # Add comment to ticket
Features
httpGET /projects/:id/features # List project features
POST /projects/:id/features # Create new feature
GET /features/:id # Get feature details
PUT /features/:id # Update feature
DELETE /features/:id # Delete feature
GET /features/:id/tickets # Get feature tickets
Comments
httpGET /comments/:id # Get comment details
PUT /comments/:id # Update comment
DELETE /comments/:id # Delete comment
🔐 Authentication Flow

<!-- ADD DIAGRAM HERE: Authentication sequence diagram -->

Show Image
JWT Implementation
typescript// JWT Payload Structure
interface JwtPayload {
sub: string; // User ID
email: string; // User email
username: string; // Username
iat: number; // Issued at
exp: number; // Expires at
}
Password Security

Hashing: bcrypt with 12 salt rounds
Validation: Strong password requirements
Storage: Never store plain text passwords

🛡️ Authorization System
Project Roles
typescriptenum ProjectRole {
OWNER = 'OWNER', // Full project control
ADMIN = 'ADMIN', // Manage members and settings
DEVELOPER = 'DEVELOPER', // Create/edit tickets and features
VIEWER = 'VIEWER' // Read-only access
}
Permission Matrix

<!-- ADD TABLE HERE: Role permission matrix -->

ActionOwnerAdminDeveloperViewerDelete Project✅❌❌❌Manage Members✅✅❌❌Create Tickets✅✅✅❌Edit Any Ticket✅✅❌❌Edit Own Tickets✅✅✅❌View Project✅✅✅✅
📊 Database Operations
Prisma Schema Highlights
prismamodel Project {
id String @id @default(cuid())
name String
description String?
ownerId String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

owner User @relation("ProjectOwner", fields: [ownerId], references: [id])
members ProjectMember[]
tickets Ticket[]
features Feature[]

@@map("projects")
}

model Ticket {
id String @id @default(cuid())
title String
description String?
status TicketStatus @default(OPEN)
priority TicketPriority @default(MEDIUM)
projectId String
featureId String?
assigneeId String?
createdById String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
feature Feature? @relation(fields: [featureId], references: [id])
assignee User? @relation("TicketAssignee", fields: [assigneeId], references: [id])
createdBy User @relation("TicketCreator", fields: [createdById], references: [id])
comments Comment[]

@@map("tickets")
}
🚀 Available Scripts
bash# Development
npm run start:dev # Start in watch mode
npm run start:debug # Start in debug mode
npm run start:prod # Start production build

# Run specific module tests

npm run test -- --testPathPattern=auth
npm run test -- --testPathPattern=projects
Integration Tests
bash# Run E2E tests
npm run test:e2e

# Test specific endpoints

npm run test:e2e -- --testNamePattern="Auth"
📊 API Documentation
Swagger/OpenAPI
Visit http://localhost:3001/api/docs when the server is running to access interactive API documentation.

<!-- ADD SCREENSHOT HERE: Swagger UI screenshot -->

Show Image
Postman Collection
Import the Postman collection for easy API testing:
json// Available at: ./docs/postman/bugtracker-api.postman_collection.json
🔧 Configuration
Environment Variables
env# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"

# Optional

PORT=3001
NODE_ENV="development"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
BCRYPT_ROUNDS=12

# Database Connection Pool

DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=10000
Docker Configuration
yaml# docker-compose.yml
version: '3.8'
services:
postgres:
image: postgres:15
environment:
POSTGRES_DB: bugtracker_db
POSTGRES_USER: bugtracker
POSTGRES_PASSWORD: password123
ports:

- "5432:5432"
  volumes:
- postgres_data:/var/lib/postgresql/data

volumes:
postgres_data:
🚧 Current Status & Roadmap
✅ Implemented Features

Complete authentication system with JWT
Full CRUD operations for all entities
Role-based authorization system
Database relationships and constraints
Comprehensive error handling
Input validation and sanitization
API documentation with Swagger

🔄 Ready for Frontend Integration

Comment system endpoints (backend complete)
File upload infrastructure
Real-time notifications setup
Advanced search and filtering
Audit logging system

🎯 Future Enhancements

WebSocket integration for real-time updates
File attachment handling
Email notification system
Advanced reporting and analytics
API rate limiting
Caching layer (Redis)

🚀 Deployment
Docker Deployment
dockerfile# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
Platform Recommendations

Railway: Easy NestJS + PostgreSQL deployment
Heroku: Traditional PaaS with PostgreSQL addon
AWS ECS: Container-based deployment
DigitalOcean App Platform: Simple full-stack deployment

🔗 Related Repositories

Frontend: bugtracker-frontend
Live API: Coming Soon

📈 Performance Considerations
Database Optimization

Proper indexing on frequently queried fields
Efficient relationship loading with Prisma
Connection pooling for concurrent requests

Security Best Practices

Input validation and sanitization
SQL injection prevention (Prisma ORM)
Rate limiting on sensitive endpoints
CORS configuration for frontend integration

📄 License
This project is open source and available under the MIT License.
👨‍💻 Developer
Your Name

GitHub: @yourusername
LinkedIn: Your LinkedIn
Email: your.email@example.com
