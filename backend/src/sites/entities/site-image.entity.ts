import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'site_images' })
export class SiteImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Site, (site) => site.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @ManyToOne(() => User, (user) => user.uploadedImages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedBy?: User;

  @Column({ name: 'full_image_data', type: 'bytea' })
  fullImageData!: Buffer;

  @Column({ name: 'thumbnail_image_data', type: 'bytea' })
  thumbnailImageData!: Buffer;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

