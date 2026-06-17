import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevCard } from '../../models/models';
import {
  getAvatar,
  getCandidateName,
  parseSpokenLanguages,
  splitCsv,
} from '../../shared/devcard-utils';

interface InfoItem {
  label: string;
  value: string;
}

/** Profilo completo del candidato (replica renderFullProfile). */
@Component({
  selector: 'app-full-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './full-profile.component.html',
})
export class FullProfileComponent {
  @Input({ required: true }) card!: DevCard;

  get avatar(): string {
    return getAvatar(this.card);
  }

  get name(): string {
    return getCandidateName(this.card);
  }

  get programmingLanguages(): string[] {
    return splitCsv(this.card?.linguaggi);
  }

  get spokenLanguages(): string[] {
    return parseSpokenLanguages(this.card?.competenze_linguistiche);
  }

  get availability(): string {
    return [
      this.card?.disponibile_ovunque ? 'Disponibile ovunque' : '',
      this.card?.smartworking ? 'Smartworking' : '',
      this.card?.luogo_preferito ? `Preferenza: ${this.card.luogo_preferito}` : '',
    ]
      .filter(Boolean)
      .join(' - ');
  }

  get details(): InfoItem[] {
    const items: InfoItem[] = [
      { label: 'Esperienza', value: `${this.card?.anni_esperienza ?? 0} anni` },
      { label: 'Citta', value: this.card?.citta || '' },
      { label: 'Distanza', value: this.card?.distanza || '' },
      { label: 'Disponibilita', value: this.availability },
    ];
    return items.filter((i) => i.value && String(i.value).trim() !== '');
  }

  get contacts(): InfoItem[] {
    const items: InfoItem[] = [
      { label: 'Telefono', value: this.card?.telefono || '' },
      { label: 'Email', value: this.card?.email || '' },
    ];
    return items.filter((i) => i.value && String(i.value).trim() !== '');
  }

  profileHref(value: string | null | undefined): string {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }
}
