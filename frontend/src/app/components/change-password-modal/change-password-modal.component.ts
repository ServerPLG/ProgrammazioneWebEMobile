import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonButton } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';

/** Modale "Cambia Password" riutilizzabile. */
@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonInput, IonButton],
  template: `
    <div class="modal-overlay" [class.active]="isOpen">
      <div class="pwd-modal">
        <button class="modal-close" type="button" (click)="close()">&times;</button>
        <h3>🔒 Cambia Password</h3>
        <form (ngSubmit)="submit()" #f="ngForm">
          <div class="form-group">
            <label>Password Attuale</label>
            <ion-input class="form-control" type="password" name="oldPassword" [(ngModel)]="oldPassword" required></ion-input>
          </div>
          <div class="form-group">
            <label>Nuova Password</label>
            <ion-input class="form-control" type="password" name="newPassword" [(ngModel)]="newPassword" required minlength="6" placeholder="Almeno 6 caratteri"></ion-input>
          </div>
          <div class="form-group">
            <label>Conferma Nuova Password</label>
            <ion-input class="form-control" type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required minlength="6"></ion-input>
          </div>
          <ion-button type="submit" expand="block" class="btn" style="margin-top: 0.5rem;">Aggiorna Password</ion-button>
          <div class="pwd-result" [style.color]="resultOk ? 'var(--primary-color)' : '#ff4b4b'">{{ resultMsg }}</div>
        </form>
      </div>
    </div>
  `,
})
export class ChangePasswordModalComponent {
  @Input({ required: true }) userId!: number;

  isOpen = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  resultMsg = '';
  resultOk = false;

  constructor(private api: ApiService) {}

  open(): void {
    this.reset();
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  private reset(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.resultMsg = '';
    this.resultOk = false;
  }

  submit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.resultOk = false;
      this.resultMsg = 'Le due password non coincidono';
      return;
    }
    this.api.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
      next: (data) => {
        this.resultOk = true;
        this.resultMsg = data.message;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.resultOk = false;
        this.resultMsg = err?.error?.error || 'Errore di connessione al server.';
      },
    });
  }
}
