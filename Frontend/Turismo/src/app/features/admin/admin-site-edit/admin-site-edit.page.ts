import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

const TOURISM_TYPES = [
  { label: 'Ecoturismo', value: 'ECOTURISMO' },
  { label: 'Playa', value: 'PLAYA' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Aventura', value: 'AVENTURA' },
];

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
  selector: 'app-admin-site-edit-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-site-edit.page.html',
})
export class AdminSiteEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly tourismTypes = TOURISM_TYPES;

  site = signal<SiteDto | null>(null);
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
  deletingImageId = signal<number | null>(null);
  showDeleteConfirm = signal(false);

  siteId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  constructor() {
    const id = this.siteId();
    this.api.get<SiteDto>(`/sites/${id}`).subscribe({
      next: (s) => {
        this.site.set(s);
        this.name = s.name;
        this.description = s.description;
        this.location = s.location;
        this.pricePerPerson = String(s.pricePerPerson);
        this.type = s.type;
        this.maxCapacity = String(s.maxCapacity);
        this.officialUrl = s.officialUrl ?? '';
      },
      error: () => this.error.set('No se pudo cargar el sitio'),
    });
  }

  getImageUrl(imageId: number): string {
    return this.api.getImageContentUrl(imageId);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files);
  }

  removeImage(imageId: number) {
    this.deletingImageId.set(imageId);
    this.api.delete(`/sites/images/${imageId}`).subscribe({
      next: () => {
        this.site.update((s) => {
          if (!s) return s;
          return {
            ...s,
            images: (s.images ?? []).filter((img) => img.id !== imageId),
          };
        });
        this.deletingImageId.set(null);
      },
      error: () => {
        this.error.set('Error al eliminar la imagen');
        this.deletingImageId.set(null);
      },
    });
  }

  submit() {
    this.error.set(null);
    const id = this.siteId();
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
      .patch<SiteDto>(`/sites/${id}`, {
        name: this.name.trim(),
        description: this.description.trim(),
        location: this.location.trim(),
        pricePerPerson: String(this.pricePerPerson),
        type: this.type,
        maxCapacity: String(this.maxCapacity),
        officialUrl: this.officialUrl.trim() || undefined,
      })
      .pipe(
        switchMap((updated) => {
          this.site.set(updated);
          const files = this.selectedFiles();
          if (files.length === 0) return of(updated);
          const uploads = files.map((file) =>
            this.api.uploadFile<unknown>(`/sites/${id}/images`, file).pipe(
              catchError(() => of(null)),
            ),
          );
          return forkJoin(uploads).pipe(
            switchMap(() => this.api.get<SiteDto>(`/sites/${id}`)),
          );
        }),
      )
      .subscribe({
        next: (s) => {
          this.site.set(s);
          this.loading.set(false);
          this.selectedFiles.set([]);
          this.error.set(null);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Error al guardar');
        },
      });
  }

  confirmDelete() {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
  }

  deleteSite() {
    const id = this.siteId();
    this.loading.set(true);
    this.api.delete(`/sites/${id}`).subscribe({
      next: () => {
        this.loading.set(false);
        this.showDeleteConfirm.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Error al eliminar el sitio');
      },
    });
  }
}
