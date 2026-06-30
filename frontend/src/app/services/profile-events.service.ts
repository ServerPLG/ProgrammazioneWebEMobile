import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DevCard } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProfileEventsService {
  private readonly cardSubject = new BehaviorSubject<DevCard | null>(null);

  readonly card$: Observable<DevCard | null> = this.cardSubject.asObservable();

  publishCard(card: DevCard): void {
    this.cardSubject.next(card);
  }
}
