import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonInput, IonTextarea, IonButton } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { MapPickerComponent, MapLocation } from '../../components/map-picker/map-picker.component';

@Component({
  selector: 'app-employer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonInput, IonTextarea, IonButton, AppHeaderComponent, MapPickerComponent],
  templateUrl: './employer-profile.page.html',
})
export class EmployerProfilePage implements OnInit {
  user!: User;
  loaded = false;

  nome_azienda = '';
  descrizione_azienda = '';
  citta = '';
  lat: number | null = null;
  lon: number | null = null;

  resultMsg = '';
  resultOk = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser()!;
    this.api.getEmployerProfile().subscribe({
      next: (data) => {
        this.nome_azienda = data.nome_azienda || '';
        this.descrizione_azienda = data.descrizione_azienda || '';
        this.citta = data.citta || '';
        this.lat = data.lat ?? null;
        this.lon = data.lon ?? null;
        this.loaded = true;
      },
      error: () => (this.loaded = true),
    });
  }

  onLocation(loc: MapLocation): void {
    this.lat = loc.lat;
    this.lon = loc.lon;
    if (loc.city) this.citta = loc.city;
  }

  save(): void {
    const payload: Record<string, unknown> = {
      nome_azienda: this.nome_azienda,
      descrizione_azienda: this.descrizione_azienda,
      citta: this.citta,
      lat: this.lat,
      lon: this.lon,
    };

    this.api.saveEmployerProfile(payload).subscribe({
      next: (data) => {
        this.resultOk = true;
        this.resultMsg = '✓ ' + data.message;
        this.auth.patchUser({
          citta: data.citta,
          lat: data.lat,
          lon: data.lon,
          nome_azienda: data.nome_azienda,
          descrizione_azienda: data.descrizione_azienda,
        });
        setTimeout(() => this.router.navigateByUrl('/employer'), 900);
      },
      error: (err) => {
        this.resultOk = false;
        this.resultMsg = '✗ ' + (err?.error?.error || 'Errore di connessione al server.');
      },
    });
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
