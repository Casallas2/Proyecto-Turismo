import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const TOURISM_TYPES = [
  { label: 'Ecoturismo', value: 'ECOTURISMO' },
  { label: 'Playa', value: 'PLAYA' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Aventura', value: 'AVENTURA' },
];

@Component({
  standalone: true,
  selector: 'app-admin-site-create-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-site-create.page.html',
})
export class AdminSiteCreatePage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly tourismTypes = TOURISM_TYPES;

  name = '';
  description = '';
  location = '';
  pricePerPerson = '';
  type: string = 'ECOTURISMO';
  maxCapacity = '';
  officialUrl = '';

  error = signal<string | null>(null);
  loading = signal(false);
  selectedFiles = signal<File[]>([]);

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files);
  }

  submit() {
    this.error.set(null);
    if (!this.name.trim() || !this.description.trim() || !this.location.trim()) {
      this.error.set('Nombre, descripción y ubicación son obligatorios.');
      return;
    }
    const price = parseFloat(this.pricePerPerson);
    const capacity = parseInt(this.maxCapacity, 10);
    if (isNaN(price) || price < 0) {
      this.error.set('El precio debe ser un número válido.');
      return;
    }
    if (isNaN(capacity) || capacity < 1) {
      this.error.set('La capacidad máxima debe ser un número mayor que 0.');
      return;
    }

    this.loading.set(true);
    this.api
      .post<{ id: number }>('/sites', {
        name: this.name.trim(),
        description: this.description.trim(),
        location: this.location.trim(),
        pricePerPerson: String(this.pricePerPerson),
        type: this.type,
        maxCapacity: String(this.maxCapacity),
        officialUrl: this.officialUrl.trim() || undefined,
      })
      .pipe(
        switchMap((site) => {
          const files = this.selectedFiles();
          if (files.length === 0) {
            return of(site);
          }
          const uploads = files.map((file) =>
            this.api.uploadFile<unknown>(`/sites/${site.id}/images`, file),
          );
          return forkJoin(uploads).pipe(switchMap(() => of(site)));
        }),
      )
      .subscribe({
        next: (site) => {
          this.loading.set(false);
          this.router.navigate(['/sites', site.id]);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Error al crear el sitio o subir imágenes');
        },
      });
  }
}
