import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Interview, User } from '../../models/models';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';

@Component({
  selector: 'app-employer-interviews',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, AppHeaderComponent],
  templateUrl: './employer-interviews.page.html',
})
export class EmployerInterviewsPage implements OnInit {
  user!: User;
  interviews: Interview[] = [];
  loaded = false;
  errored = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser()!;
    if (!this.auth.isEmployerProfileComplete(this.user)) {
      this.router.navigateByUrl('/employer-profile');
      return;
    }
    this.api.getEmployerInterviews().subscribe({
      next: (list) => {
        this.interviews = Array.isArray(list) ? list : [];
        this.loaded = true;
      },
      error: () => {
        this.errored = true;
        this.loaded = true;
      },
    });
  }

  get counts(): { pending: number; accepted: number; rejected: number } {
    return this.interviews.reduce(
      (acc, iv) => {
        acc[iv.status] = (acc[iv.status] || 0) + 1;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0 }
    );
  }

  avatar(iv: Interview): string {
    return (
      iv.foto_profilo ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        (iv.candidato_nome || '') + (iv.candidato_cognome || '')
      )}&backgroundColor=e2e8f0`
    );
  }

  formatDate(value: string | null | undefined): string {
    return value ? new Date(value).toLocaleDateString('it-IT') : 'Data N/D';
  }

  formatTime(value: string | null | undefined): string {
    return value ? value.substring(0, 5) : 'Ora N/D';
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
