import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'proyecto_turismo',
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    SitesModule,
    ReservationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
