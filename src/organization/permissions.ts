export enum OrgRoles {
  OWNER,
  ADMIN,
  MODERATOR,
}

export const DELETE_PERMISSION = OrgRoles.OWNER;
export const UPDATE_PERMISSION = OrgRoles.ADMIN;
export const REMOVE_MEMBER_PERMISSION = OrgRoles.MODERATOR;

export const ADMIN_PERMISSION = OrgRoles.OWNER;

export const MODERATOR_PERMISSION = OrgRoles.ADMIN;
