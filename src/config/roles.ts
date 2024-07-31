import { Role } from '@prisma/client';

const allRoles = {
  [Role.GIG_WORKER]: ['getUsers', 'manageUsers'],
  [Role.VERIFIER]: ['getUsers', 'manageUsers']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
