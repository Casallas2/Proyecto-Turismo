import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { SiteImage } from '../../sites/entities/site-image.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserLanguage {
  ES = 'ES',
  EN = 'EN',
  FR = 'FR',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, enumName: 'user_role', default: UserRole.USER })
  role!: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'document_id', nullable: true })
  documentId?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: UserLanguage,
    enumName: 'user_language',
    default: UserLanguage.ES,
  })
  language!: UserLanguage;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

  @OneToMany(() => SiteImage, (image) => image.uploadedBy)
  uploadedImages!: SiteImage[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs!: AuditLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

