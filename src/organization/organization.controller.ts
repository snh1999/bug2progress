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
import { GetUser, Public } from '../common/decorator';
import { AddUserDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ############################ Get all Org, Create New ##############################
  @Post()
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.create(createOrganizationDto, userid);
  }

  @Public()
  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  // ############################ Get all member, Remove existing ##############################
  @Get(':orgid/members')
  viewAllMembers(@Param('orgid') orgid: string) {
    return this.organizationService.viewAllMembers(orgid);
  }

  @Delete(':orgid/members')
  removeMember(
    @Param('orgid') orgid: string,
    @Body() dto: RemoveUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.removeMember(orgid, dto.userName, userid);
  }

  @Get(':orgid/join')
  joinOrganization(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.joinOrganization(orgid, userid);
  }

  @Get(':orgid/leave')
  leaveOrganization(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.leaveOrganization(orgid, userid);
  }
  // ############################ Get all admin, Add new, Remove existing ##############################
  @Get(':orgid/admin')
  viewAllAdmin(@Param('orgid') orgid: string) {
    return this.organizationService.viewAllAdmin(orgid);
  }

  @Post(':orgid/admin')
  addNewAdmin(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.addNewAdmin(orgid, dto.userName, userid);
  }

  @Delete(':orgid/admin')
  removeAdmin(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.removeAdmin(orgid, dto.userName, userid);
  }
  // ############################ Get all admin, Add new, Remove existing ##############################
  @Get(':orgid/moderator')
  viewAllModerators(@Param('orgid') orgid: string) {
    return this.organizationService.viewAllModerator(orgid);
  }

  @Post(':orgid/moderator')
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
  @Delete(':orgid/moderator')
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
  @Get(':orgid/posts')
  findPosts(@Param('orgid') orgid: string) {
    return this.organizationService.findPosts(orgid);
  }

  @Get(':orgid/projects')
  findProjects(@Param('orgid') orgid: string) {
    return this.organizationService.findProjects(orgid);
  }

  @Public()
  @Get(':orgid')
  findOne(@Param('orgid') orgid: string) {
    return this.organizationService.findOne(orgid);
  }

  // ############################ Get edit, delete ##############################
  // check admin later
  @Patch(':orgid')
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

  @Delete(':orgid')
  remove(@Param('orgid') orgid: string, @GetUser('id') userid: string) {
    return this.organizationService.remove(orgid, userid);
  }
}
