import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Site } from '../sites/entities/site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Site])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}

