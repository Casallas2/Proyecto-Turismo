import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { UserLanguage } from '../../users/entities/user.entity';

@Entity({ name: 'site_translations' })
export class SiteTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Site, (site) => site.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @Column({ type: 'enum', enum: UserLanguage, enumName: 'user_language' })
  language!: UserLanguage;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  location!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

