import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../entities/customer.entity';

export interface CustomerJwtPayload {
  sub: string;
  email: string;
  type: 'customer';
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  constructor(
    config: ConfigService,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (payload.type !== 'customer') throw new UnauthorizedException();
    const customer = await this.customerRepo.findOne({
      where: { id: payload.sub },
    });
    if (!customer) throw new UnauthorizedException();
    return {
      id: customer.id,
      email: customer.email,
      type: 'customer' as const,
    };
  }
}
