import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

interface ReservationDto {
  id: number;
  reservationNumber: string;
  reservationDate: string;
  peopleCount: number;
  status: string;
  totalPrice: string;
  site: {
    id: number;
    name: string;
  };
}

@Component({
  standalone: true,
  selector: 'app-my-reservations-page',
  imports: [CommonModule, RouterLink, TableModule, ButtonModule],
  templateUrl: './my-reservations.page.html',
})
export class MyReservationsPage {
  private readonly api = inject(ApiService);

  reservations = signal<ReservationDto[]>([]);
  error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load() {
    this.api.get<ReservationDto[]>('/reservations/me').subscribe({
      next: (list) => this.reservations.set(list),
      error: (err) => this.error.set(err.error?.message ?? 'Error al cargar reservas'),
    });
  }

  cancel(reservation: ReservationDto) {
    this.api.delete(`/reservations/${reservation.id}`).subscribe({
      next: () => this.load(),
      error: (err) =>
        (this.error.set(
          err.error?.message ?? 'No se pudo cancelar la reserva (revisa la política)',
        )),
    });
  }
}

