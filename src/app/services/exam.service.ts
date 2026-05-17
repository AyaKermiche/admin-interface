// FILE: exam.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ExamService {

  private apiUrl = `${API_CONFIG.apiUrl}/exam`;   // Base URL on top

  constructor(private http: HttpClient) {}

  // Get all exams (supports join parameters for candidate)
getAll(query: string = ''): Observable<any> {
  return this.http.get(`${this.apiUrl}${query}`);
}

  // Get single exam by ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Create a new exam
  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Update an exam
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Delete an exam
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}