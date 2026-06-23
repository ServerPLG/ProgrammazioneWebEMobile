import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { DevCard } from '../../models/models';
import { FullProfileComponent } from '../../components/full-profile/full-profile.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, IonContent, FullProfileComponent],
  templateUrl: './public-profile.page.html',
})
export class PublicProfilePage implements OnInit {
  card: DevCard | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.error = 'Errore: ID utente mancante nel link.';
      return;
    }
    this.api.getCv(Number(id)).subscribe({
      next: (card) => {
        this.card = card;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Profilo non trovato o non ancora compilato.';
      },
    });
  }
}
