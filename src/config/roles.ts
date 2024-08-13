import { Role } from '@prisma/client';

const allRoles = {
  [Role.GIG_WORKER]: ['verifyAadhar','verifyPAN', 'creditScore','getUsers', 'getMe'],
  [Role.VERIFIER]: ['verifyAadhar', 'verifyPAN','creditScore','getUsers', 'getMe','getQuestion']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
