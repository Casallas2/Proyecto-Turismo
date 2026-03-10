import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { SiteImage } from './entities/site-image.entity';
import { SiteTranslation } from './entities/site-translation.entity';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, SiteImage, SiteTranslation]),
    AuditModule,
  ],
  providers: [SitesService],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}

