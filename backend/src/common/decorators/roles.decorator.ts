import { SetMetadata } from '@nestjs/common';
import type { TenantRole } from '../../entities/tenant-member.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TenantRole[]) => SetMetadata(ROLES_KEY, roles);
