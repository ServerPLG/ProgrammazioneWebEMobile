import { Routes } from '@angular/router';
import { candidateGuard } from './guards/candidate.guard';
import { employerGuard } from './guards/employer.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'candidate',
    canActivate: [candidateGuard],
    loadComponent: () =>
      import('./candidate-profile/candidate-profile.page').then(
        (m) => m.CandidateProfilePage
      ),
  },
  {
    path: 'candidate-home',
    canActivate: [candidateGuard],
    loadComponent: () =>
      import('./candidate-home/candidate-home.page').then(
        (m) => m.CandidateHomePage
      ),
  },
  {
    path: 'employer',
    canActivate: [employerGuard],
    loadComponent: () =>
      import('./employer-discovery/employer-discovery.page').then(
        (m) => m.EmployerDiscoveryPage
      ),
  },
  {
    path: 'employer-profile',
    canActivate: [employerGuard],
    loadComponent: () =>
      import('./employer-profile/employer-profile.page').then(
        (m) => m.EmployerProfilePage
      ),
  },
  {
    path: 'employer-interviews',
    canActivate: [employerGuard],
    loadComponent: () =>
      import('./employer-interviews/employer-interviews.page').then(
        (m) => m.EmployerInterviewsPage
      ),
  },
  {
    path: 'saved',
    canActivate: [employerGuard],
    loadComponent: () =>
      import('./saved-devcards/saved-devcards.page').then(
        (m) => m.SavedDevcardsPage
      ),
  },
  {
    path: 'public-profile/:id',
    loadComponent: () =>
      import('./public-profile/public-profile.page').then(
        (m) => m.PublicProfilePage
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
