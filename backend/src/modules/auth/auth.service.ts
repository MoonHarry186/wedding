import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import * as crypto from 'crypto';
import { MailService } from '../../common/mail/mail.service';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMember } from '../../entities/tenant-member.entity';
import { Storefront } from '../../entities/storefront.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription } from '../../entities/subscription.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember)
    private memberRepo: Repository<TenantMember>,
    @InjectRepository(Storefront)
    private storefrontRepo: Repository<Storefront>,
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private jwtService: JwtService,
    private config: ConfigService,
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const slugTaken = await this.tenantRepo.findOne({
      where: { slug: dto.tenantSlug },
    });
    if (slugTaken) throw new ConflictException('Tenant slug already taken');

    if (!/^[a-z0-9-]+$/.test(dto.tenantSlug)) {
      throw new BadRequestException(
        'Slug must contain only lowercase letters, numbers, and hyphens',
      );
    }

    return this.dataSource.transaction(async (em) => {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = em.create(User, {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
      });
      await em.save(user);

      const tenant = em.create(Tenant, {
        name: dto.tenantName,
        slug: dto.tenantSlug,
        commissionRate: 10,
      });
      await em.save(tenant);

      const member = em.create(TenantMember, {
        userId: user.id,
        tenantId: tenant.id,
        role: 'owner',
      });
      await em.save(member);

      const storefront = em.create(Storefront, {
        tenantId: tenant.id,
        isActive: true,
      });
      await em.save(storefront);

      // Auto-subscribe to Free plan
      const freePlan = await em.findOne(SubscriptionPlan, {
        where: { name: 'Free', isActive: true },
      });
      if (freePlan) {
        const now = new Date();
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 100);
        const sub = em.create(Subscription, {
          tenantId: tenant.id,
          planId: freePlan.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: end,
          provider: 'free',
        });
        await em.save(sub);
      }

      const tokens = this.issueTokens(user, tenant.id, 'owner');
      await em.update(User, user.id, {
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
      });

      return {
        user: { id: user.id, email: user.email, fullName: user.fullName },
        tenant,
        tokens,
        role: 'owner',
      };
    });
  }

  async login(dto: LoginDto, tenantId?: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Resolve active tenantId
    let activeTenantId = tenantId;
    let role: string = 'owner';

    if (!activeTenantId) {
      const membership = await this.memberRepo.findOne({
        where: { userId: user.id },
      });
      if (!membership) throw new UnauthorizedException('User has no tenant');
      activeTenantId = membership.tenantId;
      role = membership.role;
    } else {
      const membership = await this.memberRepo.findOne({
        where: { userId: user.id, tenantId: activeTenantId },
      });
      if (!membership)
        throw new UnauthorizedException('User not a member of this tenant');
      role = membership.role;
    }

    const tokens = this.issueTokens(user, activeTenantId, role);
    await this.userRepo.update(user.id, {
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
    });

    const tenant = await this.tenantRepo.findOne({
      where: { id: activeTenantId },
    });
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      tenant,
      tokens,
      role,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        this.config.get<string>('jwt.refreshSecret')!,
      ) as unknown as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Refresh token reuse detected');

    const member = await this.memberRepo.findOne({
      where: { userId: user.id, tenantId: payload.tenantId },
    });

    const tokens = this.issueTokens(
      user,
      payload.tenantId,
      member?.role || 'editor',
    );
    await this.userRepo.update(user.id, {
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
    });
    return tokens;
  }

  async me(userId: string, tenantId: string) {
    const [user, tenant, member] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.tenantRepo.findOne({ where: { id: tenantId } }),
      this.memberRepo.findOne({ where: { userId, tenantId } }),
    ]);

    if (!user || !tenant) throw new UnauthorizedException();

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      tenant,
      role: member?.role ?? 'viewer',
    };
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    // Always return success to avoid user enumeration
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepo.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    await this.mailService.sendResetPassword(email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: token },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    await this.userRepo.update(user.id, {
      passwordHash: await bcrypt.hash(newPassword, 12),
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshTokenHash: null, // invalidate all sessions
    });
  }

  private issueTokens(user: User, tenantId: string, role: string) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId,
      role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshExpires =
      this.config.get<string>('jwt.refreshExpires') || '30d';
    const refreshToken = jwt.sign(
      payload,
      this.config.get<string>('jwt.refreshSecret')!,
      { expiresIn: refreshExpires as StringValue },
    );

    return { accessToken, refreshToken };
  }
}
