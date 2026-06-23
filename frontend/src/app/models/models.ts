// Modelli dati condivisi dell'applicazione DevCards.

export type Ruolo = 'candidato' | 'datore';

/** Utente loggato (salvato in localStorage). */
export interface User {
  id: number;
  nome: string;
  cognome: string;
  email?: string;
  ruolo: Ruolo;
  lat?: number | null;
  lon?: number | null;
  citta?: string | null;
  foto_profilo?: string | null;
  nome_azienda?: string | null;
  descrizione_azienda?: string | null;
}

/** DevCard / CV di un candidato restituito dalle API. */
export interface DevCard {
  id: number;
  nome?: string;
  cognome?: string;
  eta?: number | string | null;
  anni_esperienza?: number | string | null;
  citta?: string | null;
  lat?: number | null;
  lon?: number | null;
  email?: string | null;
  foto_profilo?: string | null;
  bio?: string | null;
  competenze?: string | null;
  linguaggi?: string | null;
  telefono?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  luogo_preferito?: string | null;
  disponibile_ovunque?: boolean | number | null;
  competenze_linguistiche?: string | null;
  smartworking?: boolean | number | null;
  distanza?: string | null;
}

/** Profilo azienda di un datore. */
export interface EmployerProfile {
  id: number;
  nome?: string;
  cognome?: string;
  citta?: string | null;
  lat?: number | null;
  lon?: number | null;
  nome_azienda?: string | null;
  descrizione_azienda?: string | null;
}

/** Richiesta di colloquio. */
export interface Interview {
  id: number;
  employer_id: number;
  candidate_id: number;
  posizione_cercata?: string;
  linguaggi_richiesti?: string | null;
  range_stipendio?: string | null;
  luogo?: string | null;
  data_colloquio?: string | null;
  ora_colloquio?: string | null;
  luogo_colloquio?: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  // Join lato candidato (dati azienda)
  azienda_nome?: string;
  azienda_cognome?: string;
  azienda_citta?: string | null;
  azienda_lat?: number | null;
  azienda_lon?: number | null;
  nome_azienda?: string | null;
  descrizione_azienda?: string | null;
  distanza?: string | null;
  // Join lato datore (dati candidato)
  candidato_nome?: string;
  candidato_cognome?: string;
  candidato_citta?: string | null;
  foto_profilo?: string | null;
}

/** Competenza linguistica con livello. */
export interface SpokenLanguage {
  lingua: string;
  livello: string;
}
