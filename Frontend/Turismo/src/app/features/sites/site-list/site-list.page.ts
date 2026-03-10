import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  images?: SiteImageDto[];
}

const TOURISM_TYPES = [
  { label: 'Todos los tipos', value: null },
  { label: 'Ecoturismo', value: 'ECOTURISMO' },
  { label: 'Playa', value: 'PLAYA' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Aventura', value: 'AVENTURA' },
];

@Component({
  standalone: true,
  selector: 'app-site-list-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './site-list.page.html',
})
export class SiteListPage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  sites = signal<SiteDto[]>([]);

  nameFilter = '';
  typeFilter: string | null = null;

  readonly tourismTypes = TOURISM_TYPES;

  constructor() {
    this.loadSites();
  }

  loadSites() {
    const params: Record<string, string> = {};
    if (this.nameFilter) {
      params['name'] = this.nameFilter;
    }
    if (this.typeFilter) {
      params['type'] = this.typeFilter;
    }

    this.api
      .get<SiteDto[]>('/sites', { params })
      .subscribe((sites) => this.sites.set(sites));
  }

  onSearch() {
    this.loadSites();
  }

  clearFilters() {
    this.nameFilter = '';
    this.typeFilter = null;
    this.loadSites();
  }

  getImageUrl(imageId: number): string {
    return this.api.getImageContentUrl(imageId);
  }
}

