import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.page.html',
})
export class AdminPage {
  readonly auth = inject(AuthService);
}
