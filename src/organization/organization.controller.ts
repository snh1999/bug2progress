import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  RemoveUserDto,
  UpdateOrganizationDto,
} from './dto';
import { JwtAuthGuard } from '../common/guard';
import { GetUser } from '../common/decorator';
import { AddUserDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ############################ Get all Org, Create New ##############################
  @Post('organization')
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.create(createOrganizationDto, userid);
  }

  @Get('organization')
  findAll() {
    return this.organizationService.findAll();
  }

  // ############################ Get all member, Remove existing ##############################
  @Get('o/:orgid/members')
  viewAllMembers(@Param('orgid') orgid: string) {
    return this.organizationService.viewAllMembers(orgid);
  }

  @Delete('o/:orgid/members')
  removeMember(
    @Param('orgid') orgid: string,
    @Body() dto: RemoveUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.removeMember(orgid, dto.userName, userid);
  }

  @Get('o/:orgid/join')
  joinOrganization(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.joinOrganization(orgid, userid);
  }

  @Get('o/:orgid/leave')
  leaveOrganization(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.leaveOrganization(orgid, userid);
  }
  // ############################ Get all admin, Add new, Remove existing ##############################
  @Get('o/:orgid/admin')
  viewAllAdmin(@Param('orgid') orgid: string) {
    return this.organizationService.viewAllAdmin(orgid);
  }

  @Post('o/:orgid/admin')
  addNewAdmin(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.addNewAdmin(orgid, dto.userName, userid);
  }

  @Delete('o/:orgid/admin')
  removeAdmin(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.removeAdmin(orgid, dto.userName, userid);
  }
  // ############################ Get all admin, Add new, Remove existing ##############################
  @Get('o/:orgid/moderator')
  viewAllModerators(@Param('orgid') orgid: string) {
    return this.organizationService.viewAllModerator(orgid);
  }

  @Post('o/:orgid/moderator')
  addNewModerators(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.addNewModerator(
      orgid,
      dto.userName,
      userid,
    );
  }
  @Delete('o/:orgid/moderator')
  removeModerator(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.removeModerator(
      orgid,
      dto.userName,
      userid,
    );
  }

  // ############################ Get all posts, projects, organization page ##############################
  @Get('o/:orgid/posts')
  findPosts(@Param('orgid') orgid: string) {
    return this.organizationService.findPosts(orgid);
  }

  @Get('o/:orgid/projects')
  findProjects(@Param('orgid') orgid: string) {
    return this.organizationService.findProjects(orgid);
  }

  @Get('o/:orgid')
  findOne(@Param('orgid') orgid: string) {
    return this.organizationService.findOne(orgid);
  }

  // ############################ Get edit, delete ##############################
  // check admin later
  @Patch('o/:orgid')
  update(
    @Param('orgid') orgid: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.update(
      orgid,
      updateOrganizationDto,
      userid,
    );
  }

  @Delete('o/:orgid')
  remove(@Param('orgid') orgid: string, @GetUser('id') userid: string) {
    return this.organizationService.remove(orgid, userid);
  }

  @Get('/:orgid')
  testRoute(@Param('orgid') orgid: string) {
    return this.organizationService.getAdminIds(orgid);
  }
}
