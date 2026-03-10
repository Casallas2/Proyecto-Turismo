import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

class DateRangeQuery {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

class TopSitesQuery {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('reservations')
  getReservationsReport(@Query() query: DateRangeQuery) {
    return this.reportsService.reservationsByDateRange(query.from, query.to);
  }

  @Get('income-by-type')
  getIncomeByType(@Query() query: DateRangeQuery) {
    return this.reportsService.incomeByTourismType(query.from, query.to);
  }

  @Get('top-sites')
  getTopSites(@Query() query: TopSitesQuery) {
    const limit = query.limit ?? 5;
    return this.reportsService.topSites(limit);
  }
}

