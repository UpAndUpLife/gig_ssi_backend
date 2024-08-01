import { Role } from '@prisma/client';

const allRoles = {
  [Role.GIG_WORKER]: ['verifyAadhar','verifyPAN', 'creditScore'],
  [Role.VERIFIER]: ['verifyAadhar', 'manageUsers']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
