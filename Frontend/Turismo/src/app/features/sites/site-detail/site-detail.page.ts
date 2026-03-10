import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface SiteImageDto {
  id: number;
}

interface SiteDto {
  id: number;
  name: string;
  description: string;
  location: string;
  pricePerPerson: string;
  type: string;
  maxCapacity: number;
  officialUrl?: string;
  images?: SiteImageDto[];
}

@Component({
  standalone: true,
  selector: 'app-site-detail-page',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './site-detail.page.html',
})
export class SiteDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  site = signal<SiteDto | null>(null);

  getImageUrl(imageId: number): string {
    return this.api.getImageContentUrl(imageId);
  }
  date: string | null = null;
  peopleCount = 1;
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get<SiteDto>(`/sites/${id}`).subscribe((s) => this.site.set(s));
  }

  createReservation() {
    this.error.set(null);
    this.success.set(null);
    const site = this.site();
    const date = this.date;

    if (!site || !date || date === '') {
      this.error.set('Debe seleccionar una fecha.');
      return;
    }

    const isoDate = date;

    this.api
      .post<any>('/reservations', {
        siteId: site.id,
        reservationDate: isoDate,
        peopleCount: this.peopleCount || 1,
      })
      .subscribe({
        next: (res) => {
          this.success.set(
            'Reserva creada en estado pendiente. Serás redirigido a la web oficial del sitio.',
          );
          if (res.externalBookingUrl) {
            window.open(res.externalBookingUrl, '_blank');
          }
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'No se pudo crear la reserva.');
        },
      });
  }
}

