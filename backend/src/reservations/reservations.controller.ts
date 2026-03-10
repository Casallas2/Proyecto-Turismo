import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReservationStatus } from './entities/reservation.entity';

class CreateReservationBody {
  @IsInt()
  @Min(1)
  siteId!: number;

  @IsDateString()
  reservationDate!: string;

  @IsInt()
  @Min(1)
  peopleCount!: number;
}

class ConfirmExternalBody {
  @IsBoolean()
  success!: boolean;

  @IsOptional()
  @IsString()
  failureReasonType?: string;

  @IsOptional()
  @IsString()
  failureReasonText?: string;
}

class UpdateStatusAdminBody {
  @IsEnum(ReservationStatus)
  status!: ReservationStatus;
}

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  createReservation(@Req() req: any, @Body() body: CreateReservationBody) {
    return this.reservationsService.create({
      userId: req.user.id,
      siteId: body.siteId,
      reservationDate: body.reservationDate,
      peopleCount: body.peopleCount,
    });
  }

  @Get('me')
  getMyReservations(@Req() req: any) {
    return this.reservationsService.findMyReservations(req.user.id);
  }

  @Delete(':id')
  cancelReservation(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancel(id, req.user.id);
  }

  @Post(':id/confirm-external')
  @UseInterceptors(FileInterceptor('file'))
  confirmExternal(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ConfirmExternalBody,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (body.success) {
      if (!file) {
        throw new Error('Se requiere comprobante cuando success es true');
      }
      return this.reservationsService.confirmExternalSuccess(
        id,
        req.user.id,
        file,
      );
    }

    return this.reservationsService.confirmExternalFailure(
      id,
      req.user.id,
      body.failureReasonType ?? 'OTRO',
      body.failureReasonText,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllReservations() {
    return this.reservationsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatusAdmin(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusAdminBody,
  ) {
    return this.reservationsService.updateStatusAdmin(
      id,
      body.status,
      req.user.id,
    );
  }
}

