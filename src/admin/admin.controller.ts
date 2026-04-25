import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorator';
import { JwtAuthGuard, RolesGuard } from '../common/guard';
import { Role } from '../common/types';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @Roles(Role.ADMIN)
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('organizations')
  @Roles(Role.ADMIN)
  getAllOrganizations() {
    return this.adminService.getAllOrganizations();
  }

  @Get('projects')
  @Roles(Role.ADMIN)
  getAllProjects() {
    return this.adminService.getAllProjects();
  }

  @Get('tickets')
  @Roles(Role.ADMIN)
  getAllTickets() {
    return this.adminService.getAllTickets();
  }

  @Get('features')
  @Roles(Role.ADMIN)
  getAllFeatures() {
    return this.adminService.getAllFeatures();
  }

  @Get('posts')
  @Roles(Role.ADMIN)
  getAllPosts() {
    return this.adminService.getAllPosts();
  }
}