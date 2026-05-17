// FILE: payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private apiUrl = `${API_CONFIG.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  // Support join parameters
  getAll(options: string = ''): Observable<any> {
    const url = options ? `${this.apiUrl}${options}` : this.apiUrl;
    return this.http.get(url);
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