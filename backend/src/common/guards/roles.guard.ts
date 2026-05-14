import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { TenantRole } from '../../entities/tenant-member.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user: { tenantId: string; tenantRole: TenantRole } }>();
    const { user } = request;
    const hasRole = requiredRoles.includes(user?.tenantRole);
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
