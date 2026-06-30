import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonTextarea, IonButton } from '@ionic/angular/standalone';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { isCandidateCvComplete } from '../shared/devcard-utils';
import { capturePhoto } from '../shared/photo.util';
import { MapPickerComponent, MapLocation } from '../components/map-picker/map-picker.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonTextarea, IonButton, MapPickerComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  mode: 'login' | 'register' = 'login';
  role: 'candidato' | 'datore' = 'candidato';

  loginEmail = '';
  loginPassword = '';

  reg = {
    nome: '',
    cognome: '',
    eta: '' as string,
    anni_esperienza: '' as string,
    linguaggi: '',
    bio: '',
    telefono: '',
    linkedin: '',
    github: '',
    email: '',
    password: '',
    citta: '',
    lat: null as number | null,
    lon: null as number | null,
  };
  fotoProfilo: string | null = null;

  recoverOpen = false;
  recoverEmail = '';
  recoverResult = '';
  recoverOk = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  showRegister(): void {
    this.mode = 'register';
  }
  showLogin(): void {
    this.mode = 'login';
  }

  onLocation(loc: MapLocation): void {
    this.reg.lat = loc.lat;
    this.reg.lon = loc.lon;
    if (loc.city) this.reg.citta = loc.city;
  }

  async takePhoto(): Promise<void> {
    const dataUrl = await capturePhoto();
    if (dataUrl) this.fotoProfilo = dataUrl;
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    this.resizeImage(file, 512, 0.85)
      .then((dataUrl) => (this.fotoProfilo = dataUrl))
      .catch(() => {
        const reader = new FileReader();
        reader.onloadend = () => (this.fotoProfilo = reader.result as string);
        reader.readAsDataURL(file);
      });
  }

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

  login(): void {
    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: (data) => {
        this.auth.setToken(data.token);
        this.auth.setUser(data.user);
        if (data.user.ruolo === 'candidato') {
          this.api.getCv(data.user.id).subscribe({
            next: (cv) => {
              this.router.navigateByUrl(
                isCandidateCvComplete(cv) ? '/candidate-home' : '/candidate'
              );
            },
            error: () => this.router.navigateByUrl('/candidate'),
          });
        } else {
          this.router.navigateByUrl(
            this.auth.isEmployerProfileComplete(data.user) ? '/employer' : '/employer-profile'
          );
        }
      },
      error: (err) => alert('Errore: ' + (err?.error?.error || 'Credenziali non valide')),
    });
  }

  register(): void {
    const payload: Record<string, unknown> = {
      ruolo: this.role,
      nome: this.reg.nome,
      cognome: this.reg.cognome,
      email: this.reg.email,
      password: this.reg.password,
      eta: null,
      anni_esperienza: 0,
      citta: null,
      lat: null,
      lon: null,
      foto_profilo: null,
      bio: null,
      linguaggi: null,
      telefono: null,
      linkedin: null,
      github: null,
    };

    if (this.role === 'candidato') {
      payload['eta'] = this.reg.eta || null;
      payload['anni_esperienza'] = this.reg.anni_esperienza || 0;
      payload['citta'] = this.reg.citta || null;
      payload['lat'] = this.reg.lat;
      payload['lon'] = this.reg.lon;
      payload['bio'] = this.reg.bio || null;
      payload['linguaggi'] = this.reg.linguaggi || null;
      payload['telefono'] = this.reg.telefono || null;
      payload['linkedin'] = this.reg.linkedin || null;
      payload['github'] = this.reg.github || null;
      payload['foto_profilo'] = this.fotoProfilo;
    }

    this.api.register(payload).subscribe({
      next: () => {
        alert('Registrazione completata! Ora puoi fare il login.');
        this.showLogin();
      },
      error: (err) => alert('Errore: ' + (err?.error?.error || 'Errore di registrazione')),
    });
  }

  openRecover(): void {
    this.recoverResult = '';
    this.recoverEmail = '';
    this.recoverOpen = true;
  }
  closeRecover(): void {
    this.recoverOpen = false;
  }
  recover(): void {
    this.api.recoverPassword(this.recoverEmail).subscribe({
      next: (data) => {
        this.recoverOk = true;
        this.recoverResult = data.message;
      },
      error: (err) => {
        this.recoverOk = false;
        this.recoverResult = err?.error?.error || 'Errore di connessione.';
      },
    });
  }
}
