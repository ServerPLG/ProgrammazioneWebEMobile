import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonContent, IonHeader, IonInput, IonTextarea, IonSelect, IonSelectOption, IonCheckbox, IonButton } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ProfileEventsService } from '../../services/profile-events.service';
import { DevCard, SpokenLanguage, User } from '../../models/models';
import { getAvatar } from '../../shared/devcard-utils';
import { capturePhoto } from '../../shared/photo.util';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { MapPickerComponent, MapLocation } from '../../components/map-picker/map-picker.component';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonInput, IonTextarea, IonSelect, IonSelectOption, IonCheckbox, IonButton, AppHeaderComponent, MapPickerComponent],
  templateUrl: './candidate-profile.page.html',
})
export class CandidateProfilePage implements OnInit, OnDestroy {
  user!: User;
  loaded = false;

  cv = {
    bio: '',
    competenze: '',
    linguaggi: '',
    luogo_preferito: '',
    telefono: '',
    instagram: '',
    linkedin: '',
    github: '',
    smartworking: false,
    disponibile_ovunque: false,
  };

  citta = '';
  lat: number | null = null;
  lon: number | null = null;

  lingue: SpokenLanguage[] = [];
  livelli = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  photoPreview = '';
  newFoto: string | null = null;

  // Diventa true al primo tentativo di salvataggio: serve a mostrare in rosso
  // i campi obbligatori lasciati vuoti.
  submitted = false;

  private navSub?: Subscription;
  private initialNavHandled = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private profileEvents: ProfileEventsService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser()!;
    this.loadProfile(); // primo caricamento garantito

    // L'editor resta in cache: ricarica i dati salvati ogni volta che si rientra
    // nella pagina, così il form non mostra valori vecchi.
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (!this.initialNavHandled) {
          this.initialNavHandled = true;
          return;
        }
        if (e.urlAfterRedirects.split('?')[0] === '/candidate' && this.user) {
          this.loadProfile();
        }
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private loadProfile(): void {
    this.loaded = false;
    this.lingue = [];
    this.newFoto = null;
    this.photoPreview =
      this.user.foto_profilo ||
      getAvatar({ id: this.user.id, nome: this.user.nome, cognome: this.user.cognome } as DevCard);

    this.api.getCv(this.user.id).subscribe({
      next: (data) => this.populate(data),
      error: () => this.populate(null),
    });
  }

  private populate(data: DevCard | null): void {
    if (data && data.id) {
      this.cv.bio = data.bio || '';
      this.cv.competenze = data.competenze || '';
      this.cv.linguaggi = data.linguaggi || '';
      this.cv.luogo_preferito = data.luogo_preferito || '';
      this.cv.telefono = data.telefono || '';
      this.cv.instagram = data.instagram || '';
      this.cv.linkedin = data.linkedin || '';
      this.cv.github = data.github || '';
      this.cv.smartworking = !!data.smartworking;
      this.cv.disponibile_ovunque = !!data.disponibile_ovunque;
      this.citta = data.citta || '';
      this.lat = data.lat ?? null;
      this.lon = data.lon ?? null;
      this.photoPreview = data.foto_profilo || this.photoPreview;

      try {
        const parsed = JSON.parse(data.competenze_linguistiche || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.lingue = parsed.map((l: SpokenLanguage) => ({ lingua: l.lingua || '', livello: l.livello || 'B1' }));
        } else {
          this.addLingua();
        }
      } catch {
        this.addLingua();
      }
    } else {
      this.citta = this.user.citta || '';
      this.lat = this.user.lat ?? null;
      this.lon = this.user.lon ?? null;
      this.addLingua();
    }
    this.loaded = true;
  }

  addLingua(lingua = '', livello = 'B1'): void {
    this.lingue.push({ lingua, livello });
  }

  removeLingua(index: number): void {
    this.lingue.splice(index, 1);
  }

  onLocation(loc: MapLocation): void {
    this.lat = loc.lat;
    this.lon = loc.lon;
    if (loc.city) this.citta = loc.city;
  }

  /** Scatta/sceglie una foto con la fotocamera del device (Capacitor Camera). */
  async takePhoto(): Promise<void> {
    const dataUrl = await capturePhoto();
    if (dataUrl) {
      this.newFoto = dataUrl;
      this.photoPreview = dataUrl;
    }
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // Ridimensiona e comprime l'immagine prima di salvarla: cosi' il data URL
    // resta leggero (qualche decina di KB) e non supera il max_allowed_packet
    // di MySQL, che faceva fallire il salvataggio con foto grandi.
    this.resizeImage(file, 512, 0.85)
      .then((dataUrl) => {
        this.newFoto = dataUrl;
        this.photoPreview = dataUrl;
      })
      .catch(() => {
        // Fallback: usa l'immagine originale se il ridimensionamento fallisce.
        const reader = new FileReader();
        reader.onload = () => {
          this.newFoto = reader.result as string;
          this.photoPreview = this.newFoto;
        };
        reader.readAsDataURL(file);
      });
  }

  /** Ridimensiona un'immagine mantenendo le proporzioni e la restituisce come data URL JPEG. */
  private resizeImage(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height >= width && height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas non disponibile'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Immagine non valida'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Lettura file fallita'));
      reader.readAsDataURL(file);
    });
  }

  /** Campi obbligatori del CV, usati anche dal template per l'evidenziazione rossa. */
  isMissing(field: 'bio' | 'competenze' | 'linguaggi' | 'luogo_preferito'): boolean {
    return this.submitted && !((this.cv[field] || '').trim());
  }

  save(): void {
    this.submitted = true;

    // Se mancano i campi obbligatori non salvo: il template li mostra in rosso.
    if (
      this.isMissing('bio') ||
      this.isMissing('competenze') ||
      this.isMissing('linguaggi') ||
      this.isMissing('luogo_preferito')
    ) {
      return;
    }

    const lingueArray = this.lingue
      .map((l) => ({ lingua: (l.lingua || '').trim(), livello: l.livello }))
      .filter((l) => l.lingua);

    const payload: Record<string, unknown> = {
      user_id: this.user.id,
      bio: this.cv.bio,
      competenze: this.cv.competenze,
      linguaggi: this.cv.linguaggi,
      telefono: this.cv.telefono,
      instagram: this.cv.instagram,
      linkedin: this.cv.linkedin,
      github: this.cv.github,
      luogo_preferito: this.cv.luogo_preferito,
      citta: this.citta,
      lat: this.lat,
      lon: this.lon,
      disponibile_ovunque: this.cv.disponibile_ovunque,
      competenze_linguistiche: JSON.stringify(lingueArray),
      smartworking: this.cv.smartworking,
      foto_profilo: this.newFoto,
    };

    this.api.saveCv(payload).subscribe({
      next: (data) => {
        const patch: Partial<User> = { citta: data.citta, lat: data.lat, lon: data.lon };
        if (data.foto_profilo) patch.foto_profilo = data.foto_profilo;
        this.auth.patchUser(patch);
        // Recupera la DevCard aggiornata completa e la pubblica nel servizio:
        // la home, iscritta, mostra subito l'anteprima aggiornata.
        this.api.getCv(this.user.id).subscribe({
          next: (freshCard) => this.profileEvents.publishCard(freshCard),
          error: () => {
            /* la home ricarichera' comunque dal server al prossimo ingresso */
          },
        });
        alert('Il tuo CV e stato aggiornato con successo sulla tua DevCard!');
        this.router.navigateByUrl('/candidate-home');
      },
      error: (err) => alert('Errore: ' + (err?.error?.error || 'Errore di connessione.')),
    });
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
