// FILE: src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private readonly baseUrl = API_CONFIG.apiUrl;   // e.g. http://localhost:3400/api

  constructor(private http: HttpClient) {}

  /**
   * GET all records from a table
   * Example: /api/candidate
   */
  getAll<T>(table: string, options: string = ''): Observable<T[]> {
    const url = options 
      ? `${this.baseUrl}/${table}${options}` 
      : `${this.baseUrl}/${table}`;

    return this.http.get<T[]>(url, { withCredentials: true });
  }

  /**
   * GET one record by ID
   * Example: /api/candidate/5
   */
  getOne<T>(table: string, id: number, options: string = ''): Observable<T> {
    const url = options 
      ? `${this.baseUrl}/${table}/${id}?${options}` 
      : `${this.baseUrl}/${table}/${id}`;

    return this.http.get<T>(url, { withCredentials: true });
  }

  /**
   * CREATE a new record
   * Example: POST /api/candidate
   */
  create<T>(table: string, data: any): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${table}`, 
      data, 
      { withCredentials: true }
    );
  }

  /**
   * UPDATE a record
   * Example: PUT /api/candidate/5
   */
  update<T>(table: string, id: number, data: any): Observable<T> {
    return this.http.put<T>(
      `${this.baseUrl}/${table}/${id}`, 
      data, 
      { withCredentials: true }
    );
  }

  /**
   * DELETE a record
   * Example: DELETE /api/candidate/5
   */
  delete(table: string, id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${table}/${id}`, 
      { withCredentials: true }
    );
  }

  /**
   * Count records (optional helper)
   */
  count(table: string, options: string = ''): Observable<{ results: number }> {
    return this.http.get<{ results: number }>(
      `${this.baseUrl}/${table}?page=1,0${options ? '&' + options : ''}`,
      { withCredentials: true }
    );
  }

  /**
   * Upload file helper
   */
  addFile<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${endpoint}`, 
      formData, 
      { withCredentials: true }
    );
  }

  /**
   * Get statistics
   */
  getStat<T>(date1: string = '', date2: string = ''): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/dashboard-stat/${date1}/${date2}`,
      { withCredentials: true }
    );
  }

  /**
   * Export statistics
   */
  exportStat(type: string = '', date1: string = '', date2: string = '') {
    window.open(
      `${this.baseUrl}/export-stat/${type}/${date1}/${date2}`,
      '_blank'
    );
  }
}