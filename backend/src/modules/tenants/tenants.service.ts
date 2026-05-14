import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { promises as dns } from 'dns';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMember } from '../../entities/tenant-member.entity';
import { User } from '../../entities/user.entity';
import { Storefront } from '../../entities/storefront.entity';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import type { InviteMemberDto } from './dto/invite-member.dto';
import type { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import type {
  UpdateStorefrontDto,
  SetCustomDomainDto,
} from './dto/update-storefront.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMember)
    private memberRepo: Repository<TenantMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Storefront)
    private storefrontRepo: Repository<Storefront>,
  ) {}

  async findById(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(tenantId: string, dto: UpdateTenantDto) {
    await this.tenantRepo.update(tenantId, dto);
    return this.findById(tenantId);
  }

  async getMembers(tenantId: string) {
    return this.memberRepo.find({
      where: { tenantId },
      relations: ['user'],
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { id: true, email: true, fullName: true, avatarUrl: true },
      },
    });
  }

  async inviteMember(tenantId: string, dto: InviteMemberDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user)
      throw new NotFoundException('User not found — they must register first');

    const existing = await this.memberRepo.findOne({
      where: { tenantId, userId: user.id },
    });
    if (existing) throw new ConflictException('User is already a member');

    const member = this.memberRepo.create({
      tenantId,
      userId: user.id,
      role: dto.role,
    });
    return this.memberRepo.save(member);
  }

  async updateMemberRole(
    tenantId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    requestingUserId: string,
  ) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === 'owner')
      throw new ForbiddenException('Cannot change owner role');
    if (member.userId === requestingUserId)
      throw new ForbiddenException('Cannot change your own role');

    member.role = dto.role;
    return this.memberRepo.save(member);
  }

  async removeMember(
    tenantId: string,
    memberId: string,
    requestingUserId: string,
  ) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === 'owner')
      throw new ForbiddenException('Cannot remove owner');
    if (member.userId === requestingUserId)
      throw new ForbiddenException('Cannot remove yourself');

    await this.memberRepo.remove(member);
  }

  // ─── Storefront ──────────────────────────────────────────────────────────

  async getStorefront(tenantId: string) {
    const sf = await this.storefrontRepo.findOne({ where: { tenantId } });
    if (!sf) throw new NotFoundException('Storefront not found');
    return sf;
  }

  async updateStorefront(tenantId: string, dto: UpdateStorefrontDto) {
    const sf = await this.getStorefront(tenantId);
    Object.assign(sf, dto);
    return this.storefrontRepo.save(sf);
  }

  async setCustomDomain(tenantId: string, dto: SetCustomDomainDto) {
    const existing = await this.storefrontRepo.findOne({
      where: { customDomain: dto.customDomain },
    });
    if (existing && existing.tenantId !== tenantId) {
      throw new ConflictException(
        'Domain is already in use by another storefront',
      );
    }

    const sf = await this.getStorefront(tenantId);
    const token = randomBytes(16).toString('hex');
    sf.customDomain = dto.customDomain;
    sf.domainVerified = false;
    sf.domainVerificationToken = token;
    await this.storefrontRepo.save(sf);

    return {
      customDomain: dto.customDomain,
      verificationToken: token,
      instructions: `Add a DNS TXT record: _cinlove-verify.${dto.customDomain} = "${token}"`,
    };
  }

  async verifyDomain(tenantId: string) {
    const sf = await this.getStorefront(tenantId);
    if (!sf.customDomain) throw new BadRequestException('No custom domain set');
    if (!sf.domainVerificationToken)
      throw new BadRequestException('Initiate domain setup first');
    if (sf.domainVerified)
      return { verified: true, message: 'Domain already verified' };

    const lookupHost = `_cinlove-verify.${sf.customDomain}`;
    let records: string[][] = [];
    try {
      records = await dns.resolveTxt(lookupHost);
    } catch {
      throw new BadRequestException(
        `DNS TXT record not found for ${lookupHost}`,
      );
    }

    const flat = records.flat();
    if (!flat.includes(sf.domainVerificationToken)) {
      throw new BadRequestException(
        `TXT record found but token does not match. Expected: "${sf.domainVerificationToken}"`,
      );
    }

    sf.domainVerified = true;
    await this.storefrontRepo.save(sf);
    return { verified: true, customDomain: sf.customDomain };
  }
}
