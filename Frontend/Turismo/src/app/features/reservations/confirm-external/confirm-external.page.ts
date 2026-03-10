import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

const FAILURE_REASONS = [
  { label: 'Página caída', value: 'PAGINA_CAIDA' },
  { label: 'Sin disponibilidad', value: 'SIN_DISPONIBILIDAD' },
  { label: 'Error en datos', value: 'ERROR_DATOS' },
  { label: 'Otro motivo', value: 'OTRO' },
];

@Component({
  standalone: true,
  selector: 'app-confirm-external-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './confirm-external.page.html',
})
export class ConfirmExternalPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  reservationId = Number(this.route.snapshot.paramMap.get('id'));

  success: boolean | null = null;
  failureReasonType = 'PAGINA_CAIDA';
  failureReasonText = '';
  file: File | null = null;

  error = signal<string | null>(null);
  done = signal(false);

  readonly failureReasons = FAILURE_REASONS;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    } else {
      this.file = null;
    }
  }

  submit() {
    this.error.set(null);
    if (this.success === null) {
      this.error.set('Debes indicar si lograste o no reservar.');
      return;
    }

    const formData = new FormData();
    formData.append('success', String(this.success));

    if (this.success) {
      if (!this.file) {
        this.error.set('Debes subir un comprobante.');
        return;
      }
      formData.append('file', this.file);
    } else {
      formData.append('failureReasonType', this.failureReasonType);
      if (this.failureReasonType === 'OTRO') {
        formData.append('failureReasonText', this.failureReasonText);
      }
    }

    this.api
      .post(`/reservations/${this.reservationId}/confirm-external`, formData)
      .subscribe({
        next: () => this.done.set(true),
        error: (err) =>
          this.error.set(err.error?.message ?? 'No se pudo confirmar la reserva'),
      });
  }
}

