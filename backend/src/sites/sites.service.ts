import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site, TourismType } from './entities/site.entity';
import { SiteImage } from './entities/site-image.entity';
import { SiteTranslation } from './entities/site-translation.entity';
import { AuditService } from '../audit/audit.service';

interface SiteFilters {
  name?: string;
  type?: TourismType;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(SiteImage)
    private readonly imageRepository: Repository<SiteImage>,
    @InjectRepository(SiteTranslation)
    private readonly translationRepository: Repository<SiteTranslation>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(filters: SiteFilters = {}): Promise<Site[]> {
    const qb = this.siteRepository
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.images', 'image')
      .where('site.active = :active', { active: true });

    if (filters.name) {
      qb.andWhere('LOWER(site.name) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.type) {
      qb.andWhere('site.type = :type', { type: filters.type });
    }

    if (filters.minPrice !== undefined) {
      qb.andWhere('site.price_per_person >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      qb.andWhere('site.price_per_person <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    qb.orderBy('site.name', 'ASC');

    return qb.getMany();
  }

  async findOne(id: number): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: ['images', 'translations'],
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return site;
  }

  async create(data: Partial<Site>, userId: string): Promise<Site> {
    const site = this.siteRepository.create(data);
    const saved = await this.siteRepository.save(site);
    await this.auditService.logChange({
      userId,
      entityName: 'Site',
      entityId: String(saved.id),
      action: 'CREATE',
      afterData: saved,
    });
    return saved;
  }

  async update(id: number, data: Partial<Site>, userId: string): Promise<Site> {
    const site = await this.findOne(id);
    const before = { ...site };
    Object.assign(site, data);
    const saved = await this.siteRepository.save(site);
    await this.auditService.logChange({
      userId,
      entityName: 'Site',
      entityId: String(id),
      action: 'UPDATE',
      beforeData: before,
      afterData: saved,
    });
    return saved;
  }

  async remove(id: number, userId: string): Promise<void> {
    const site = await this.findOne(id);
    await this.siteRepository.remove(site);
    await this.auditService.logChange({
      userId,
      entityName: 'Site',
      entityId: String(id),
      action: 'DELETE',
      beforeData: site,
    });
  }

  async addImage(
    siteId: number,
    file: Express.Multer.File,
    userId: string,
  ): Promise<SiteImage> {
    const site = await this.findOne(siteId);

    const image = this.imageRepository.create({
      site,
      uploadedBy: { id: userId } as any,
      fullImageData: file.buffer,
      thumbnailImageData: file.buffer,
      mimeType: file.mimetype,
    });

    const saved = await this.imageRepository.save(image);

    await this.auditService.logChange({
      userId,
      entityName: 'SiteImage',
      entityId: String(saved.id),
      action: 'CREATE',
      afterData: { siteId, mimeType: file.mimetype },
    });

    return saved;
  }

  async removeImage(id: number, userId: string): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['site'],
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.imageRepository.remove(image);
    await this.auditService.logChange({
      userId,
      entityName: 'SiteImage',
      entityId: String(id),
      action: 'DELETE',
      beforeData: { siteId: image.site.id },
    });
  }

  async getImageById(id: number): Promise<SiteImage> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }
}

