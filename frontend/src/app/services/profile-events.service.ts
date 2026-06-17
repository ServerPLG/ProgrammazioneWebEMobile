import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DevCard } from '../models/models';

/**
 * Stato condiviso della DevCard del candidato.
 *
 * E' un BehaviorSubject: conserva sempre l'ultima versione pubblicata e la
 * "ri-emette" a chi si iscrive in un secondo momento. Così la home mostra la
 * DevCard aggiornata appena l'editor la pubblica, indipendentemente dal fatto
 * che la pagina home sia rimasta in cache, sia stata ricreata o si stia
 * iscrivendo solo ora (non dipende dai lifecycle di Ionic).
 */
@Injectable({ providedIn: 'root' })
export class ProfileEventsService {
  private readonly cardSubject = new BehaviorSubject<DevCard | null>(null);

  /** Ultima DevCard pubblicata (null finche' non ne viene caricata una). */
  readonly card$: Observable<DevCard | null> = this.cardSubject.asObservable();

  /** Pubblica la DevCard aggiornata (home iniziale o editor dopo il salvataggio). */
  publishCard(card: DevCard): void {
    this.cardSubject.next(card);
  }
}
