import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonContent, IonHeader, IonButton } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DevCard, User } from '../../models/models';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { DevcardComponent } from '../../components/devcard/devcard.component';
import { FullProfileComponent } from '../../components/full-profile/full-profile.component';
import { ChangePasswordModalComponent } from '../../components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-employer-discovery',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent, IonHeader, IonButton,
    AppHeaderComponent,
    DevcardComponent,
    FullProfileComponent,
    ChangePasswordModalComponent,
  ],
  templateUrl: './employer-discovery.page.html',
})
export class EmployerDiscoveryPage implements OnInit, OnDestroy {
  @ViewChild('pwdModal') pwdModal!: ChangePasswordModalComponent;

  user!: User;
  candidates: DevCard[] = [];
  index = 0;
  loaded = false;
  errored = false;

  swipeClass = '';
  profileOpen = false;
  profileCard: DevCard | null = null;

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
    this.loadCards(); // primo caricamento garantito

    // La pagina resta in cache: ricarica i candidati ogni volta che si torna
    // sulla discovery (anche dai Preferiti), così quelli eliminati riappaiono.
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (!this.initialNavHandled) {
          this.initialNavHandled = true;
          return;
        }
        const url = e.urlAfterRedirects.split('?')[0];
        if (url === '/employer' && this.user && this.auth.isEmployerProfileComplete(this.user)) {
          this.loadCards();
        }
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private loadCards(): void {
    this.api.getDevcards().subscribe({
      next: (list) => {
        this.candidates = Array.isArray(list) ? list : [];
        this.index = 0;
        this.loaded = true;
      },
      error: () => {
        this.errored = true;
        this.loaded = true;
      },
    });
  }

  get current(): DevCard | null {
    return this.index < this.candidates.length ? this.candidates[this.index] : null;
  }

  get finished(): boolean {
    return this.loaded && !this.errored && this.index >= this.candidates.length;
  }

  handle(action: 'save' | 'skip'): void {
    const candidate = this.current;
    if (!candidate) return;

    this.swipeClass = action === 'save' ? 'swipe-right' : 'swipe-left';

    this.api.interact(candidate.id, action).subscribe({
      error: (err) => console.error('Errore salvataggio interazione', err),
    });

    setTimeout(() => {
      this.index++;
      this.swipeClass = '';
    }, 300);
  }

  openProfile(card: DevCard): void {
    this.profileCard = card;
    this.profileOpen = true;
  }

  closeProfile(): void {
    this.profileOpen = false;
    this.profileCard = null;
  }

  openPasswordModal(): void {
    this.pwdModal.open();
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
