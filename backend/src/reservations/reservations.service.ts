import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Site } from '../sites/entities/site.entity';
import { AuditService } from '../audit/audit.service';
import { ReservationReceipt } from './entities/reservation-receipt.entity';

interface CreateReservationInput {
  userId: string;
  siteId: number;
  reservationDate: string;
  peopleCount: number;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(ReservationReceipt)
    private readonly receiptRepository: Repository<ReservationReceipt>,
    private readonly auditService: AuditService,
  ) {}

  private async ensureCapacity(
    site: Site,
    reservationDate: string,
    peopleCount: number,
  ) {
    const totalReserved = await this.reservationRepository
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.people_count), 0)', 'sum')
      .where('r.site_id = :siteId', { siteId: site.id })
      .andWhere('r.reservation_date = :date', { date: reservationDate })
      .andWhere('r.status IN (:...statuses)', {
        statuses: [
          ReservationStatus.PENDIENTE_EXTERNO,
          ReservationStatus.CONFIRMADA_EXTERNA,
        ],
      })
      .getRawOne<{ sum: string }>();

    const current = Number(totalReserved?.sum ?? 0);
    const nextTotal = current + peopleCount;
    if (nextTotal > site.maxCapacity) {
      throw new BadRequestException('No hay disponibilidad para esa fecha');
    }
  }

  async create(input: CreateReservationInput): Promise<Reservation> {
    const site = await this.siteRepository.findOne({
      where: { id: input.siteId, active: true },
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }

    await this.ensureCapacity(
      site,
      input.reservationDate,
      input.peopleCount,
    );

    const reservation = this.reservationRepository.create({
      user: { id: input.userId } as any,
      site,
      reservationDate: input.reservationDate,
      peopleCount: input.peopleCount,
      status: ReservationStatus.PENDIENTE_EXTERNO,
      totalPrice: String(
        Number(site.pricePerPerson) * Number(input.peopleCount),
      ),
      externalBookingUrl: site.officialUrl,
    });

    const saved = await this.reservationRepository.save(reservation);
    saved.reservationNumber = `RES-${saved.id.toString().padStart(6, '0')}`;
    const finalReservation = await this.reservationRepository.save(saved);

    await this.auditService.logChange({
      userId: input.userId,
      entityName: 'Reservation',
      entityId: String(finalReservation.id),
      action: 'CREATE',
      afterData: finalReservation,
    });

    return finalReservation;
  }

  async findMyReservations(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['site'],
      order: { reservationDate: 'DESC' },
    });
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      relations: ['site', 'user'],
      order: { reservationDate: 'DESC' },
    });
  }

  private canCancel(reservation: Reservation): boolean {
    const today = new Date();
    const date = new Date(reservation.reservationDate);
    const diffMs = date.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 2;
  }

  async cancel(id: number, userId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    if (reservation.user.id !== userId) {
      throw new ForbiddenException();
    }
    if (!this.canCancel(reservation)) {
      throw new BadRequestException(
        'La reserva solo puede cancelarse hasta 2 días antes',
      );
    }

    const before = { ...reservation };
    reservation.status = ReservationStatus.CANCELADA;
    const saved = await this.reservationRepository.save(reservation);

    await this.auditService.logChange({
      userId,
      entityName: 'Reservation',
      entityId: String(id),
      action: 'STATUS_CHANGE',
      beforeData: before,
      afterData: saved,
    });

    return saved;
  }

  async confirmExternalSuccess(
    id: number,
    userId: string,
    file: any,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    if (reservation.user.id !== userId) {
      throw new ForbiddenException();
    }

    const before = { ...reservation };

    reservation.status = ReservationStatus.CONFIRMADA_EXTERNA;

    const saved = await this.reservationRepository.save(reservation);

    const receipt = this.receiptRepository.create({
      reservation: saved,
      fileData: file.buffer,
      mimeType: file.mimetype,
    });
    await this.receiptRepository.save(receipt);

    await this.auditService.logChange({
      userId,
      entityName: 'Reservation',
      entityId: String(id),
      action: 'STATUS_CHANGE',
      beforeData: before,
      afterData: saved,
    });

    return saved;
  }

  async confirmExternalFailure(
    id: number,
    userId: string,
    failureReasonType: string,
    failureReasonText?: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    if (reservation.user.id !== userId) {
      throw new ForbiddenException();
    }

    const before = { ...reservation };

    reservation.status = ReservationStatus.NO_RESERVADA;
    reservation.failureReasonType = failureReasonType;
    reservation.failureReasonText = failureReasonText;

    const saved = await this.reservationRepository.save(reservation);

    await this.auditService.logChange({
      userId,
      entityName: 'Reservation',
      entityId: String(id),
      action: 'STATUS_CHANGE',
      beforeData: before,
      afterData: saved,
    });

    return saved;
  }

  async updateStatusAdmin(
    id: number,
    status: ReservationStatus,
    adminId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const before = { ...reservation };
    reservation.status = status;
    const saved = await this.reservationRepository.save(reservation);

    await this.auditService.logChange({
      userId: adminId,
      entityName: 'Reservation',
      entityId: String(id),
      action: 'STATUS_CHANGE_ADMIN',
      beforeData: before,
      afterData: saved,
    });

    return saved;
  }
}

