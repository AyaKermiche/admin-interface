import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SessionService {

  private apiUrl = `${API_CONFIG.apiUrl}/session`;

  constructor(private http: HttpClient) {}

  // Get all sessions with joins and filters
  getAll(options: string = ''): Observable<any> {
    const url = options ? `${this.apiUrl}${options}` : this.apiUrl;
    return this.http.get(url);
  }
  getToday(): Observable<any> {
  return this.http.get(`${this.apiUrl}?today=true`);
}


  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}