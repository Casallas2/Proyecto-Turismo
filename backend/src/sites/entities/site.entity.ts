import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SiteImage } from './site-image.entity';
import { SiteTranslation } from './site-translation.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

export enum TourismType {
  ECOTURISMO = 'ECOTURISMO',
  PLAYA = 'PLAYA',
  CULTURAL = 'CULTURAL',
  AVENTURA = 'AVENTURA',
}

@Entity({ name: 'sites' })
export class Site {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  location!: string;

  @Column({ name: 'price_per_person', type: 'numeric', precision: 10, scale: 2 })
  pricePerPerson!: string;

  @Column({ type: 'enum', enum: TourismType, enumName: 'tourism_type' })
  type!: TourismType;

  @Column({ name: 'max_capacity' })
  maxCapacity!: number;

  @Column({ name: 'official_url', nullable: true })
  officialUrl?: string;

  @Column({ default: true })
  active!: boolean;

  @OneToMany(() => SiteImage, (image) => image.site)
  images!: SiteImage[];

  @OneToMany(() => SiteTranslation, (translation) => translation.site)
  translations!: SiteTranslation[];

  @OneToMany(() => Reservation, (reservation) => reservation.site)
  reservations!: Reservation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

