import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { RefreshDto } from '../auth/dto/refresh.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register customer account (or upgrade guest to full account)',
  })
  register(@Body() dto: CustomerRegisterDto) {
    return this.customersService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login' })
  login(@Body() dto: CustomerLoginDto) {
    return this.customersService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh customer access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.customersService.refresh(dto.refreshToken);
  }

  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get customer profile' })
  getMe(@CurrentUser() user: { id: string }) {
    return this.customersService.getProfile(user.id);
  }

  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @Get('me/orders')
  @ApiOperation({ summary: 'Get customer order history' })
  getOrders(@CurrentUser() user: { id: string }) {
    return this.customersService.getMyOrders(user.id);
  }

  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @Get('me/invitations')
  @ApiOperation({ summary: 'Get customer invitations' })
  getInvitations(@CurrentUser() user: { id: string }) {
    return this.customersService.getMyInvitations(user.id);
  }
}
