import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { IonContent, IonHeader, IonButton } from '@ionic/angular/standalone';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ProfileEventsService } from '../services/profile-events.service';
import { DevCard, EmployerProfile, Interview, User } from '../models/models';
import { isCandidateCvComplete } from '../shared/devcard-utils';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { DevcardComponent } from '../components/devcard/devcard.component';
import { MapPickerComponent } from '../components/map-picker/map-picker.component';
import { ChangePasswordModalComponent } from '../components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-candidate-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent, IonHeader, IonButton,
    AppHeaderComponent,
    DevcardComponent,
    MapPickerComponent,
    ChangePasswordModalComponent,
  ],
  templateUrl: './candidate-home.page.html',
})
export class CandidateHomePage implements OnInit, OnDestroy {
  @ViewChild('pwdModal') pwdModal!: ChangePasswordModalComponent;

  user!: User;
  card: DevCard | null = null;
  cardReady = false;
  publicUrl = '';

  interviews: Interview[] = [];
  interviewsLoaded = false;

  companyOpen = false;
  company: EmployerProfile | null = null;

  private cardSub?: Subscription;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private profileEvents: ProfileEventsService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser()!;

    this.cardSub = this.profileEvents.card$.subscribe((card) => {
      if (card && card.id === this.user.id) {
        this.card = card;
        this.cardReady = true;
      }
    });

    this.loadInterviews();
    this.loadCard();
  }

  ngOnDestroy(): void {
    this.cardSub?.unsubscribe();
  }

  private async loadCard(): Promise<void> {
    try {
      const card = await firstValueFrom(this.api.getCv(this.user.id));
      if (!isCandidateCvComplete(card)) {
        this.router.navigateByUrl('/candidate');
        return;
      }
      this.publicUrl = await this.buildPublicUrl();
      this.profileEvents.publishCard(card);
    } catch {
      this.router.navigateByUrl('/candidate');
    }
  }

  private async buildPublicUrl(): Promise<string> {
    let origin = window.location.origin;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      try {
        const data = await firstValueFrom(this.api.getServerIp());
        if (data?.ip && data.ip !== 'localhost') {
          const port = window.location.port ? `:${window.location.port}` : '';
          origin = `${window.location.protocol}//${data.ip}${port}`;
        }
      } catch {

      }
    }
    return `${origin}/public-profile/${this.user.id}`;
  }

  private loadInterviews(): void {
    this.api.getCandidateInterviews().subscribe({
      next: (list) => {
        this.interviews = Array.isArray(list) ? list : [];
        this.interviewsLoaded = true;
      },
      error: () => {
        this.interviews = [];
        this.interviewsLoaded = true;
      },
    });
  }

  respond(interview: Interview, status: 'accepted' | 'rejected'): void {
    this.api.setInterviewStatus(interview.id, status).subscribe({
      next: () => this.loadInterviews(),
      error: (err) => console.error(err),
    });
  }

  companyName(iv: Interview): string {
    return iv.nome_azienda || `${iv.azienda_nome || ''} ${iv.azienda_cognome || ''}`.trim();
  }

  openCompany(iv: Interview): void {
    this.api.getEmployer(iv.employer_id).subscribe({
      next: (company) => {
        this.company = company;
        this.companyOpen = true;
      },
      error: (err) => console.error(err),
    });
  }

  closeCompany(): void {
    this.companyOpen = false;
    this.company = null;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/D';
    return new Date(value).toLocaleDateString('it-IT');
  }

  formatTime(value: string | null | undefined): string {
    return value ? value.substring(0, 5) : 'N/D';
  }

  openPasswordModal(): void {
    this.pwdModal.open();
  }

  printCard(): void {
    // La DevCard vive dentro <ion-content> (shadow DOM, position:absolute,
    // overflow:hidden): stampandola "in loco" Ionic ne ritaglia il contenuto e
    // la stampa esce sballata. Per una stampa affidabile cloniamo le due facce
    // in un contenitore figlio diretto di <body>, fuori dai container Ionic.
    const source = document.querySelector(
      'app-devcard .dc-flip-card'
    ) as HTMLElement | null;
    if (!source) {
      window.print();
      return;
    }

    const printRoot = document.createElement('div');
    printRoot.className = 'dc-print-root';

    const clone = source.cloneNode(true) as HTMLElement;
    clone.classList.remove('is-flipped'); // stampa sempre fronte poi retro
    printRoot.appendChild(clone);
    document.body.appendChild(printRoot);
    document.body.classList.add('card-print-page');

    const cleanup = () => {
      document.body.classList.remove('card-print-page');
      printRoot.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    // Lasciamo al browser un frame per applicare il layout di stampa.
    setTimeout(() => window.print(), 60);
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
