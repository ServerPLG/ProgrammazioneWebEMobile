import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { DevCard, EmployerProfile, Interview, User } from '../models/models';

export interface SavedFilters {
  linguaggio?: string;
  citta?: string;
  anniExpMin?: string;
  lingua?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly base = Capacitor.isNativePlatform()
    ? environment.nativeApiUrl
    : environment.apiUrl;

  constructor(private http: HttpClient) {}

  private url(path: string): string {
    return `${this.base}${path}`;
  }

  register(payload: Record<string, unknown>): Observable<{ message: string; userId: number }> {
    return this.http.post<{ message: string; userId: number }>(this.url('/api/register'), payload);
  }

  login(email: string, password: string): Observable<{ message: string; user: User; token: string }> {
    return this.http.post<{ message: string; user: User; token: string }>(this.url('/api/login'), { email, password });
  }

  recoverPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.url('/api/recover-password'), { email });
  }

  changePassword(old_password: string, new_password: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.url('/api/change-password'), { old_password, new_password });
  }

  getDevcards(): Observable<DevCard[]> {
    return this.http.get<DevCard[]>(this.url('/api/devcards'));
  }

  interact(candidate_id: number, action: 'save' | 'skip'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.url('/api/interact'), { candidate_id, action });
  }

  removeInteraction(candidate_id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.url('/api/interact'), { body: { candidate_id } });
  }

  getSavedDevcards(filters: SavedFilters = {}): Observable<DevCard[]> {
    let params = new HttpParams();
    if (filters.linguaggio) params = params.set('linguaggio', filters.linguaggio);
    if (filters.citta) params = params.set('citta', filters.citta);
    if (filters.anniExpMin) params = params.set('anniExpMin', filters.anniExpMin);
    if (filters.lingua) params = params.set('lingua', filters.lingua);
    return this.http.get<DevCard[]>(this.url('/api/devcards/saved'), { params });
  }

  getCv(userId: number): Observable<DevCard> {
    return this.http.get<DevCard>(this.url(`/api/cv/${userId}`));
  }

  saveCv(payload: Record<string, unknown>): Observable<{ message: string; foto_profilo?: string | null; citta?: string | null; lat?: number | null; lon?: number | null }> {
    return this.http.post<{ message: string; foto_profilo?: string | null; citta?: string | null; lat?: number | null; lon?: number | null }>(this.url('/api/cv'), payload);
  }

  proposeInterview(payload: Record<string, unknown>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.url('/api/interview'), payload);
  }

  getCandidateInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.url('/api/candidate/interviews'));
  }

  setInterviewStatus(interview_id: number, status: 'accepted' | 'rejected'): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.url('/api/interview/status'), { interview_id, status });
  }

  getEmployerInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.url('/api/employer/interviews'));
  }

  getEmployer(id: number): Observable<EmployerProfile> {
    return this.http.get<EmployerProfile>(this.url(`/api/employer/${id}`));
  }

  getEmployerProfile(): Observable<EmployerProfile> {
    return this.http.get<EmployerProfile>(this.url('/api/employer-profile'));
  }

  saveEmployerProfile(payload: Record<string, unknown>): Observable<{ message: string; citta?: string | null; lat?: number | null; lon?: number | null; nome_azienda?: string | null; descrizione_azienda?: string | null }> {
    return this.http.post<{ message: string; citta?: string | null; lat?: number | null; lon?: number | null; nome_azienda?: string | null; descrizione_azienda?: string | null }>(this.url('/api/employer-profile'), payload);
  }

  getServerIp(): Observable<{ ip: string }> {
    return this.http.get<{ ip: string }>(this.url('/api/server-ip'));
  }
}
