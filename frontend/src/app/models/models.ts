export type Ruolo = 'candidato' | 'datore';

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

  azienda_nome?: string;
  azienda_cognome?: string;
  azienda_citta?: string | null;
  azienda_lat?: number | null;
  azienda_lon?: number | null;
  nome_azienda?: string | null;
  descrizione_azienda?: string | null;
  distanza?: string | null;

  candidato_nome?: string;
  candidato_cognome?: string;
  candidato_citta?: string | null;
  foto_profilo?: string | null;
}

export interface SpokenLanguage {
  lingua: string;
  livello: string;
}
