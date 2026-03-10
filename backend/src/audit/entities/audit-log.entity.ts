import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'entity_name' })
  entityName!: string;

  @Column({ name: 'entity_id' })
  entityId!: string;

  @Column()
  action!: string;

  @Column({ name: 'before_data', type: 'jsonb', nullable: true })
  beforeData?: unknown;

  @Column({ name: 'after_data', type: 'jsonb', nullable: true })
  afterData?: unknown;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

