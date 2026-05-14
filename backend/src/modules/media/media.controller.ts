import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: undefined })) // memory storage
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.mediaService.upload(file, tenantId, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded files for current tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.mediaService.findAll(tenantId);
  }

  @Get('stock')
  @ApiOperation({ summary: 'List stock resource categories from R2' })
  listStockCategories() {
    return this.mediaService.listStockCategories();
  }

  @Get('stock/:category')
  @ApiOperation({ summary: 'List stock assets in a category' })
  listStockAssets(
    @Param('category') category: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.mediaService.listStockAssets(decodeURIComponent(category), {
      limit: limit ? Number(limit) : undefined,
      cursor,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.mediaService.remove(tenantId, id);
  }
}
