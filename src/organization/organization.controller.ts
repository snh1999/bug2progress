import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, Public } from '../common/decorator';
import { JwtAuthGuard } from '../common/guard';
import type {
  ChangeMemberRoleDto,
  CreateOrganizationDto,
  OrgMemberRoleDto,
  OrgMembersDto,
  UpdateOrganizationDto,
} from './dto';
import type { OrganizationService } from './organization.service';

@ApiTags('Organization')
@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

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
