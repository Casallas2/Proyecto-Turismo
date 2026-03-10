import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Site } from '../../sites/entities/site.entity';
import { ReservationReceipt } from './reservation-receipt.entity';

export enum ReservationStatus {
  PENDIENTE_EXTERNO = 'PENDIENTE_EXTERNO',
  CONFIRMADA_EXTERNA = 'CONFIRMADA_EXTERNA',
  NO_RESERVADA = 'NO_RESERVADA',
  CANCELADA = 'CANCELADA',
}

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'reservation_number', unique: true, nullable: true })
  reservationNumber!: string;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Site, (site) => site.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @Column({ name: 'reservation_date', type: 'date' })
  reservationDate!: string;

  @Column({ name: 'people_count' })
  peopleCount!: number;

  @Column({ type: 'enum', enum: ReservationStatus, enumName: 'reservation_status' })
  status!: ReservationStatus;

  @Column({ name: 'total_price', type: 'numeric', precision: 10, scale: 2 })
  totalPrice!: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'external_booking_url', nullable: true })
  externalBookingUrl?: string;

  @Column({ name: 'failure_reason_type', nullable: true })
  failureReasonType?: string;

  @Column({ name: 'failure_reason_text', type: 'text', nullable: true })
  failureReasonText?: string;

  @OneToMany(() => ReservationReceipt, (receipt) => receipt.reservation)
  receipts!: ReservationReceipt[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

