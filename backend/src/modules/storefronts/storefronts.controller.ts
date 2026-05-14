import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { StorefrontsService } from './storefronts.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('storefronts')
export class StorefrontsController {
  constructor(private readonly svc: StorefrontsService) {}

  @Public()
  @Get(':slug')
  getPublic(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getPublicStorefront(slug, page, limit);
  }
}
