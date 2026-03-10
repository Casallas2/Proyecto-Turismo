import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  // TODO: mover a configuración de entorno
  private readonly baseUrl = 'http://localhost:3000';

  /** URL para mostrar el contenido de una imagen de sitio (GET público). */
  getImageContentUrl(imageId: number): string {
    return `${this.baseUrl}/sites/images/${imageId}/content`;
  }

  readonly loading = signal(false);

  get<T>(url: string, options?: object) {
    this.loading.set(true);
    return this.http.get<T>(`${this.baseUrl}${url}`, options);
  }

  post<T>(url: string, body: unknown, options?: object) {
    this.loading.set(true);
    return this.http.post<T>(`${this.baseUrl}${url}`, body, options);
  }

  patch<T>(url: string, body: unknown, options?: object) {
    this.loading.set(true);
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, options);
  }

  delete<T>(url: string, options?: object) {
    this.loading.set(true);
    return this.http.delete<T>(`${this.baseUrl}${url}`, options);
  }

  /** Sube un archivo a la URL indicada (multipart/form-data con campo "file"). */
  uploadFile<T>(url: string, file: File, options?: object) {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<T>(`${this.baseUrl}${url}`, formData, options);
  }
}

