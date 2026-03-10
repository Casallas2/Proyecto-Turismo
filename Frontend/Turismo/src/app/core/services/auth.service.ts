import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  accessToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly tokenKey = 'turismo_token';

  private readonly _jwt = signal<JwtPayload | null>(null);

  readonly user = computed(() => this._jwt());
  readonly isAuthenticated = computed(() => !!this._jwt());
  readonly isAdmin = computed(() => this._jwt()?.role === 'ADMIN');

  constructor() {
    if (this.isBrowser) {
      const token = this.getToken();
      if (token) {
        this.decodeAndSetToken(token);
      }
    }
  }

  private get storage(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }
    return window.localStorage;
  }

  login(email: string, password: string) {
    return this.api
      .post<LoginResponse>('/auth/login', { email, password })
      .pipe(
        tap((res) => {
          this.storage?.setItem(this.tokenKey, res.accessToken);
          this.decodeAndSetToken(res.accessToken);
          this.router.navigateByUrl('/');
        }),
      );
  }

  register(payload: {
    fullName: string;
    email: string;
    password: string;
    language?: string;
  }) {
    return this.api.post('/auth/register', payload);
  }

  logout() {
    this.storage?.removeItem(this.tokenKey);
    this._jwt.set(null);
    this.router.navigateByUrl('/');
  }

  getToken(): string | null {
    return this.storage?.getItem(this.tokenKey) ?? null;
  }

  private decodeAndSetToken(token: string) {
    try {
      const payloadPart = token.split('.')[1];
      const decodedJson = atob(payloadPart);
      const payload = JSON.parse(decodedJson) as JwtPayload;
      this._jwt.set(payload);
    } catch {
      this._jwt.set(null);
    }
  }
}

