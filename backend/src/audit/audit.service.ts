import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logChange(options: {
    userId?: string;
    entityName: string;
    entityId: string;
    action: string;
    beforeData?: unknown;
    afterData?: unknown;
  }): Promise<void> {
    const log = this.auditRepository.create({
      user: options.userId ? ({ id: options.userId } as any) : undefined,
      entityName: options.entityName,
      entityId: options.entityId,
      action: options.action,
      beforeData: options.beforeData,
      afterData: options.afterData,
    });

    await this.auditRepository.save(log);
  }
}

