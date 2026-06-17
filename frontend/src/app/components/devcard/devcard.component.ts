import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';
import { DevCard } from '../../models/models';
import {
  CARD_LANGUAGE_LIMIT,
  getAvatar,
  parseSpokenLanguages,
  splitCsv,
} from '../../shared/devcard-utils';

interface Contact {
  label: string;
  value: string;
  icon: 'phone' | 'email' | 'linkedin' | 'github';
}

/**
 * DevCard compatta (fronte) con eventuale retro a QR code.
 * Riproduce il rendering del vecchio devcard.js in forma di componente Angular.
 */
@Component({
  selector: 'app-devcard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devcard.component.html',
})
export class DevcardComponent implements OnChanges {
  @Input({ required: true }) card!: DevCard;
  @Input() showDistance = false;
  @Input() contactMode: 'full' | 'locked' = 'full';
  /** Mostra il retro con QR (card girabile). */
  @Input() includeBack = false;
  /** URL da codificare nel QR (richiesto se includeBack). */
  @Input() qrData = '';

  flipped = false;
  qrImage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['qrData'] && this.qrData) {
      this.generateQr();
    }
  }

  private generateQr(): void {
    QRCode.toDataURL(this.qrData, {
      width: 210,
      margin: 1,
      color: { dark: '#2f6b43', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then((url) => (this.qrImage = url))
      .catch((err) => console.error('Errore generazione QR:', err));
  }

  toggleFlip(): void {
    if (this.includeBack) {
      this.flipped = !this.flipped;
    }
  }

  get avatar(): string {
    return getAvatar(this.card);
  }

  get city(): string {
    return this.card?.citta || this.card?.luogo_preferito || 'N/D';
  }

  get languages(): string[] {
    return splitCsv(this.card?.linguaggi).slice(0, CARD_LANGUAGE_LIMIT);
  }

  get spokenLanguages(): string[] {
    return parseSpokenLanguages(this.card?.competenze_linguistiche);
  }

  get contacts(): Contact[] {
    const locked = this.contactMode === 'locked';
    const lockMsg = 'Salva il profilo per sbloccare i contatti';
    return [
      { label: 'Telefono', value: locked ? lockMsg : this.card?.telefono || 'N/D', icon: 'phone' },
      { label: 'Email', value: locked ? lockMsg : this.card?.email || 'N/D', icon: 'email' },
      { label: 'LinkedIn', value: locked ? lockMsg : this.card?.linkedin || 'N/D', icon: 'linkedin' },
      { label: 'GitHub', value: locked ? lockMsg : this.card?.github || 'N/D', icon: 'github' },
    ];
  }

  onContact(event: Event, contact: Contact): void {
    event.preventDefault();
    event.stopPropagation();
    window.alert(`${contact.label}: ${contact.value || 'N/D'}`);
  }
}
