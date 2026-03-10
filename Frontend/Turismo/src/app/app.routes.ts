import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'sites',
        loadComponent: () =>
          import('./features/sites/site-list/site-list.page').then(
            (m) => m.SiteListPage,
          ),
      },
      {
        path: 'sites/:id',
        loadComponent: () =>
          import('./features/sites/site-detail/site-detail.page').then(
            (m) => m.SiteDetailPage,
          ),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/reservations/my-reservations/my-reservations.page').then(
            (m) => m.MyReservationsPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.page').then((m) => m.AdminPage),
      },
      {
        path: 'admin/sites/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-site-create/admin-site-create.page').then(
            (m) => m.AdminSiteCreatePage,
          ),
      },
      {
        path: 'admin/sites/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-site-edit/admin-site-edit.page').then(
            (m) => m.AdminSiteEditPage,
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'reservations/:id/confirm',
    loadComponent: () =>
      import('./features/reservations/confirm-external/confirm-external.page').then(
        (m) => m.ConfirmExternalPage,
      ),
  },
];
