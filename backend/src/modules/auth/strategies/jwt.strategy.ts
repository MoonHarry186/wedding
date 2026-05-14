import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User } from '../../../entities/user.entity';
import { TenantMember } from '../../../entities/tenant-member.entity';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

function extractFromCookie(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.accessToken ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(TenantMember)
    private memberRepo: Repository<TenantMember>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();

    const member = await this.memberRepo.findOne({
      where: { userId: payload.sub, tenantId: payload.tenantId },
    });

    if (!req['tenantId']) {
      req['tenantId'] = payload.tenantId;
    }

    const result: {
      id: string;
      email: string;
      fullName: string | null;
      tenantId: string;
      tenantRole: string | undefined;
    } = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      tenantId: payload.tenantId,
      tenantRole: member?.role,
    };
    return result;
  }
}
