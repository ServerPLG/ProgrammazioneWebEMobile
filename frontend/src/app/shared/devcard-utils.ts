import { DevCard, SpokenLanguage } from '../models/models';

export const CARD_LANGUAGE_LIMIT = 6;

/** Divide una stringa CSV in array ripulito. */
export function splitCsv(value: string | null | undefined): string[] {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Interpreta le competenze linguistiche (formato JSON oppure testo semplice). */
export function parseSpokenLanguages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return (parsed as SpokenLanguage[])
        .filter((item) => item && (item.lingua || item.livello))
        .map(
          (item) =>
            `${item.lingua || 'Lingua'}${item.livello ? ` (${item.livello})` : ''}`
        );
    }
  } catch {
    // fallback al formato testo semplice
  }
  return splitCsv(raw);
}

/** Nome completo del candidato. */
export function getCandidateName(card: DevCard | null | undefined): string {
  return `${card?.nome || ''} ${card?.cognome || ''}`.trim() || 'Candidato';
}

/** Avatar del candidato (foto caricata oppure avatar generato). */
export function getAvatar(card: DevCard | null | undefined): string {
  if (card?.foto_profilo) return card.foto_profilo;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    getCandidateName(card)
  )}&backgroundColor=e2e8f0`;
}

/** Verifica se il CV del candidato e' completo. */
export function isCandidateCvComplete(card: DevCard | null | undefined): boolean {
  return !!(
    card &&
    card.bio &&
    card.competenze &&
    card.linguaggi &&
    (card.luogo_preferito || card.disponibile_ovunque)
  );
}
