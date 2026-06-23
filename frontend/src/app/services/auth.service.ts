import { Injectable } from '@angular/core';
import { User } from '../models/models';

/**
 * Gestione dell'utente autenticato, con stato persistito in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'user';
  private readonly TOKEN_KEY = 'token';

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /** Token JWT ricevuto al login, da inviare nelle chiamate protette. */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /** Aggiorna solo alcuni campi dell'utente salvato. */
  patchUser(patch: Partial<User>): User | null {
    const current = this.getUser();
    if (!current) return null;
    const updated = { ...current, ...patch };
    this.setUser(updated);
    return updated;
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null && this.getToken() !== null;
  }

  isCandidate(): boolean {
    return this.getUser()?.ruolo === 'candidato';
  }

  isEmployer(): boolean {
    return this.getUser()?.ruolo === 'datore';
  }

  /** Verifica se il profilo azienda del datore e' completo. */
  isEmployerProfileComplete(user: User | null): boolean {
    return !!(
      user &&
      user.nome_azienda &&
      user.descrizione_azienda &&
      user.citta
    );
  }
}
