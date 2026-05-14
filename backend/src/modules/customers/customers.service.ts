import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { Customer } from '../../entities/customer.entity';
import { Order } from '../../entities/order.entity';
import { Invitation } from '../../entities/invitation.entity';
import type { CustomerRegisterDto } from './dto/customer-register.dto';
import type { CustomerLoginDto } from './dto/customer-login.dto';
import type { CustomerJwtPayload } from './strategies/customer-jwt.strategy';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: CustomerRegisterDto) {
    const existing = await this.customerRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      // If guest account (no password) → upgrade to full account
      if (!existing.passwordHash && dto.password) {
        const passwordHash = await bcrypt.hash(dto.password, 12);
        existing.passwordHash = passwordHash;
        existing.fullName = dto.fullName;
        if (dto.phone) existing.phone = dto.phone;
        await this.customerRepo.save(existing);
        const tokens = await this.issueTokens(existing);
        return { customer: this.sanitize(existing), tokens };
      }
      throw new ConflictException('Email already registered');
    }

    const customer = this.customerRepo.create({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      passwordHash: dto.password ? await bcrypt.hash(dto.password, 12) : null,
    });
    await this.customerRepo.save(customer);
    const tokens = await this.issueTokens(customer);
    return { customer: this.sanitize(customer), tokens };
  }

  async login(dto: CustomerLoginDto) {
    const customer = await this.customerRepo.findOne({
      where: { email: dto.email },
    });
    if (!customer?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(customer);
    return { customer: this.sanitize(customer), tokens };
  }

  async refresh(refreshToken: string) {
    let payload: CustomerJwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        this.config.get<string>('jwt.refreshSecret')!,
      ) as unknown as CustomerJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'customer') throw new UnauthorizedException();

    const customer = await this.customerRepo.findOne({
      where: { id: payload.sub },
    });
    if (!customer?.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, customer.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Refresh token reuse detected');

    const tokens = await this.issueTokens(customer);
    return tokens;
  }

  async getProfile(customerId: string) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.sanitize(customer);
  }

  async getMyOrders(customerId: string) {
    return this.orderRepo.find({
      where: { customerId },
      relations: ['items', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyInvitations(customerId: string) {
    return this.invitationRepo.find({
      where: { customerId },
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  private async issueTokens(customer: Customer) {
    const payload: CustomerJwtPayload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshExpires =
      this.config.get<string>('jwt.refreshExpires') || '30d';
    const refreshToken = jwt.sign(
      payload,
      this.config.get<string>('jwt.refreshSecret')!,
      { expiresIn: refreshExpires as StringValue },
    );
    await this.customerRepo.update(customer.id, {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    });
    return { accessToken, refreshToken };
  }

  private sanitize(c: Customer) {
    const { passwordHash, refreshTokenHash, ...safe } = c;
    void passwordHash;
    void refreshTokenHash;
    return safe;
  }
}
