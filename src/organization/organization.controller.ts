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
  UpdateOrganizationDto,
  OrgMembersDto,
  OrgMemberRoleDto,
  ChangeMemberRoleDto,
} from './dto';
import { JwtAuthGuard } from '../common/guard';
import { GetUser, Public } from '../common/decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Organization')
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
  // TODO - TEST
  @Get(':orgid/members')
  viewAllMembers(
    @Param('orgid') orgid: string,
    @Body() dto?: OrgMemberRoleDto, // admin/moderator
  ) {
    if (dto) return this.organizationService.viewMembersByRole(orgid, dto.role);
    return this.organizationService.viewAllMembers(orgid);
  }

  // create new entry at membership table
  @Post(':orgid/members')
  joinOrganization(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.joinOrganization(orgid, userid);
  }

  // TODO - TEST
  // user - moderator/admin
  // admin - user/moderator
  @Patch(':orgid/members')
  changeMemberRole(
    @Param('orgid') orgid: string,
    @Body() dto: ChangeMemberRoleDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.changeMemberRole(orgid, dto, userid);
  }

  // TODO - TEST
  @Delete(':orgid/members')
  removeMember(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
    @Body() dto?: OrgMembersDto,
  ) {
    if (dto)
      return this.organizationService.removeMemberBy(
        orgid,
        dto.userName,
        userid,
      );
    return this.organizationService.removeMember(orgid, userid);
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
