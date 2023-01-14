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
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { JwtAuthGuard } from '../common/guard';
import { GetUser } from '../common/decorator';
import { AddUserDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

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

  @Get('o/:orgid/members')
  findMembers(@Param('orgid') orgid: string) {
    return this.organizationService.findMembers(orgid);
  }

  @Get('o/:orgid/posts')
  findPosts(@Param('orgid') orgid: string) {
    return this.organizationService.findPosts(orgid);
  }

  @Get('o/:orgid/projects')
  findProjects(@Param('orgid') orgid: string) {
    return this.organizationService.findProjects(orgid);
  }

  @Get('o/:orgid/join')
  joinOrganization(
    @Param('orgid') orgid: string,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.joinOrganization(orgid, userid);
  }

  @Post('o/:orgid/addAdmin')
  addNewAdmin(
    @Param('orgid') orgid: string,
    @Body() dto: AddUserDto,
    @GetUser('id') userid: string,
  ) {
    return this.organizationService.addNewAdmin(orgid, dto, userid);
  }

  @Get('o/:orgid')
  findOne(@Param('orgid') orgid: string) {
    return this.organizationService.findOne(orgid);
  }

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
}
