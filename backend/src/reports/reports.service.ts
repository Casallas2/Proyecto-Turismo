import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Site } from '../sites/entities/site.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async reservationsByDateRange(from: string, to: string) {
    const qb = this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('r.site', 's')
      .select('s.id', 'siteId')
      .addSelect('s.name', 'siteName')
      .addSelect('COUNT(r.id)', 'reservationsCount')
      .where('r.reservation_date BETWEEN :from AND :to', { from, to })
      .groupBy('s.id')
      .addGroupBy('s.name')
      .orderBy('reservationsCount', 'DESC');

    return qb.getRawMany();
  }

  async incomeByTourismType(from: string, to: string) {
    const qb = this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('r.site', 's')
      .select('s.type', 'type')
      .addSelect('SUM(r.total_price)', 'income')
      .where('r.reservation_date BETWEEN :from AND :to', { from, to })
      .andWhere('r.status = :status', { status: 'CONFIRMADA_EXTERNA' })
      .groupBy('s.type');

    return qb.getRawMany();
  }

  async topSites(limit = 5) {
    const qb = this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('r.site', 's')
      .select('s.id', 'siteId')
      .addSelect('s.name', 'siteName')
      .addSelect('COUNT(r.id)', 'reservationsCount')
      .groupBy('s.id')
      .addGroupBy('s.name')
      .orderBy('reservationsCount', 'DESC')
      .limit(limit);

    return qb.getRawMany();
  }
}

