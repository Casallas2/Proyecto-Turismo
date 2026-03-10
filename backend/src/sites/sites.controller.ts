import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { SitesService } from './sites.service';
import { TourismType } from './entities/site.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import * as express from 'express';

class SitesQuery {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(TourismType)
  type?: TourismType;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;
}

class CreateSiteBody {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  location!: string;

  @IsNumberString()
  pricePerPerson!: string;

  @IsEnum(TourismType)
  type!: TourismType;

  @IsNumberString()
  maxCapacity!: string;

  @IsOptional()
  @IsString()
  officialUrl?: string;
}

class UpdateSiteBody {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumberString()
  pricePerPerson?: string;

  @IsOptional()
  @IsEnum(TourismType)
  type?: TourismType;

  @IsOptional()
  @IsNumberString()
  maxCapacity?: string;

  @IsOptional()
  @IsString()
  officialUrl?: string;
}

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  getSites(@Query() query: SitesQuery) {
    const filters = {
      name: query.name,
      type: query.type,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    };
    return this.sitesService.findAll(filters);
  }

  @Get('images/:imageId/content')
  async getImageContent(
    @Param('imageId', ParseIntPipe) imageId: number,
    @Res() res: express.Response,
  ) {
    const image = await this.sitesService.getImageById(imageId);
    res.setHeader('Content-Type', image.mimeType);
    res.send(image.fullImageData);
  }

  @Get(':id')
  getSite(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createSite(@Req() req: any, @Body() body: CreateSiteBody) {
    return this.sitesService.create(
      {
        name: body.name,
        description: body.description,
        location: body.location,
        pricePerPerson: body.pricePerPerson,
        type: body.type,
        maxCapacity: Number(body.maxCapacity),
        officialUrl: body.officialUrl,
        active: true,
      },
      req.user.id,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSite(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: UpdateSiteBody,
  ) {
    const data: any = { ...body };
    if (body.pricePerPerson !== undefined) {
      data.pricePerPerson = body.pricePerPerson;
    }
    if (body.maxCapacity !== undefined) {
      data.maxCapacity = Number(body.maxCapacity);
    }
    return this.sitesService.update(id, data, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteSite(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.sitesService.remove(id, req.user.id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.sitesService.addImage(id, file, req.user.id);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteImage(@Param('imageId', ParseIntPipe) imageId: number, @Req() req: any) {
    return this.sitesService.removeImage(imageId, req.user.id);
  }
}

