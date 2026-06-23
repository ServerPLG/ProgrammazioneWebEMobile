import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonContent, IonHeader, IonInput, IonButton } from '@ionic/angular/standalone';
import { ApiService, SavedFilters } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DevCard, User } from '../../models/models';
import { getCandidateName } from '../../shared/devcard-utils';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { DevcardComponent } from '../../components/devcard/devcard.component';
import { FullProfileComponent } from '../../components/full-profile/full-profile.component';

@Component({
  selector: 'app-saved-devcards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent, IonHeader, IonInput, IonButton,
    AppHeaderComponent,
    DevcardComponent,
    FullProfileComponent,
  ],
  templateUrl: './saved-devcards.page.html',
})
export class SavedDevcardsPage implements OnInit, OnDestroy {
  user!: User;
  cards: DevCard[] = [];
  loaded = false;
  errored = false;

  filters: SavedFilters = { linguaggio: '', citta: '', anniExpMin: '', lingua: '' };

  profileOpen = false;
  profileCard: DevCard | null = null;

  interviewOpen = false;
  interviewResult = '';
  interviewOk = false;
  minDate = '';
  iv = {
    candidateId: 0,
    candidateName: '',
    posizione_cercata: '',
    linguaggi_richiesti: '',
    range_stipendio: '',
    luogo: '',
    luogo_colloquio: '',
    data_colloquio: '',
    ora_colloquio: '',
  };

  private navSub?: Subscription;
  private initialNavHandled = false;

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
    this.minDate = this.tomorrow();
    this.load(); // primo caricamento garantito

    // La pagina resta in cache: ricarica i preferiti ogni volta che si torna
    // sulla pagina, così restano allineati con salvataggi/rimozioni.
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (!this.initialNavHandled) {
          this.initialNavHandled = true;
          return;
        }
        if (e.urlAfterRedirects.split('?')[0] === '/saved' && this.user && this.auth.isEmployerProfileComplete(this.user)) {
          this.load();
        }
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private tomorrow(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  load(): void {
    this.loaded = false;
    this.errored = false;
    this.api.getSavedDevcards(this.filters).subscribe({
      next: (list) => {
        this.cards = Array.isArray(list) ? list : [];
        this.loaded = true;
      },
      error: () => {
        this.errored = true;
        this.loaded = true;
      },
    });
  }

  applyFilters(): void {
    this.load();
  }

  openProfile(card: DevCard): void {
    this.profileCard = card;
    this.profileOpen = true;
  }

  closeProfile(): void {
    this.profileOpen = false;
    this.profileCard = null;
  }

  removeCard(card: DevCard): void {
    if (!confirm('Rimuovere questo candidato dai preferiti?')) return;
    this.api.removeInteraction(card.id).subscribe({
      next: () => this.load(),
      error: () => alert('Errore durante la rimozione.'),
    });
  }

  openInterview(card: DevCard): void {
    this.iv = {
      candidateId: card.id,
      candidateName: getCandidateName(card),
      posizione_cercata: '',
      linguaggi_richiesti: '',
      range_stipendio: '',
      luogo: '',
      luogo_colloquio: '',
      data_colloquio: '',
      ora_colloquio: '',
    };
    this.interviewResult = '';
    this.interviewOpen = true;
  }

  closeInterview(): void {
    this.interviewOpen = false;
  }

  submitInterview(): void {
    if (this.iv.data_colloquio < this.tomorrow()) {
      this.interviewOk = false;
      this.interviewResult = 'La data del colloquio deve essere successiva a quella corrente.';
      return;
    }

    const payload: Record<string, unknown> = {
      candidate_id: this.iv.candidateId,
      posizione_cercata: this.iv.posizione_cercata,
      linguaggi_richiesti: this.iv.linguaggi_richiesti,
      range_stipendio: this.iv.range_stipendio,
      luogo: this.iv.luogo,
      data_colloquio: this.iv.data_colloquio,
      ora_colloquio: this.iv.ora_colloquio,
      luogo_colloquio: this.iv.luogo_colloquio,
    };

    this.api.proposeInterview(payload).subscribe({
      next: (data) => {
        this.interviewOk = true;
        this.interviewResult = data.message;
        setTimeout(() => (this.interviewOpen = false), 1200);
      },
      error: (err) => {
        this.interviewOk = false;
        this.interviewResult = err?.error?.error || 'Errore di connessione.';
      },
    });
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
