// FILE: candidate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {

  private apiUrl = `${API_CONFIG.apiUrl}/candidate`;   // ← Correct endpoint

  constructor(private http: HttpClient) {}

  getAllCandidates(options: string = ''): Observable<any> {
    const url = options ? `${this.apiUrl}${options}` : this.apiUrl;
    return this.http.get(url);
  }

  getCandidate(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCandidate(candidate: any): Observable<any> {
    return this.http.post(this.apiUrl, candidate);
  }

  updateCandidate(id: number, candidate: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, candidate);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}