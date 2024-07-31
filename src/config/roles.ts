import { Role } from '@prisma/client';

const allRoles = {
  [Role.GIG_WORKER]: ['verifyAadhar'],
  [Role.VERIFIER]: ['verifyAadhar', 'manageUsers']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
