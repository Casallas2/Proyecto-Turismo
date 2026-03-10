import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  sites = signal<SiteDto[]>([]);
  readonly isAdmin = this.auth.isAdmin;
  readonly isAuthenticated = this.auth.isAuthenticated;

  constructor() {
    this.api.get<SiteDto[]>('/sites').subscribe((sites) => this.sites.set(sites));
  }

  getImageUrl(imageId: number): string {
    return this.api.getImageContentUrl(imageId);
  }
}

