import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';

interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  documentId?: string;
  country?: string;
  language: string;
}

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = this.auth.isAdmin;
  user = signal<UserDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  currentPassword = '';
  newPassword = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.api.get<UserDto>('/users/me').subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al cargar el perfil');
        this.loading.set(false);
      },
    });
  }

  saveProfile() {
    const u = this.user();
    if (!u) return;
    this.error.set(null);
    this.success.set(null);

    this.api
      .patch<UserDto>('/users/me', {
        fullName: u.fullName,
        phone: u.phone,
        address: u.address,
        documentId: u.documentId,
        country: u.country,
      })
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.success.set('Perfil actualizado correctamente');
        },
        error: (err) =>
          this.error.set(err.error?.message ?? 'No se pudo actualizar el perfil'),
      });
  }

  changePassword() {
    this.error.set(null);
    this.success.set(null);

    this.api
      .patch('/users/me/password', {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.success.set('Contraseña actualizada correctamente');
          this.currentPassword = '';
          this.newPassword = '';
        },
        error: (err) =>
          this.error.set(err.error?.message ?? 'No se pudo cambiar la contraseña'),
      });
  }

  logout() {
    this.auth.logout();
  }
}

