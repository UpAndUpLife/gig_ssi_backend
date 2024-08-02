import { Role } from '@prisma/client';

const allRoles = {
  [Role.GIG_WORKER]: ['verifyAadhar','verifyPAN', 'creditScore','getUsers'],
  [Role.VERIFIER]: ['verifyAadhar', 'manageUsers','getUsers']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
