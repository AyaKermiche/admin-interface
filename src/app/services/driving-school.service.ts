import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DrivingSchool } from '../models/driving-school.model';

@Injectable({
  providedIn: 'root',
})
export class DrivingSchoolService {
  private apiUrl = `${API_CONFIG.apiUrl}/driving-school`;

  constructor(private http: HttpClient) {}

  getAll(options: string = ''): Observable<any> {
    const url = options ? `${this.apiUrl}${options}` : this.apiUrl;
    return this.http.get(url);
  }

  getById(id: number): Observable<DrivingSchool> {
    return this.http.get<DrivingSchool>(`${this.apiUrl}/${id}`);
  }

  create(data: Omit<DrivingSchool, 'id'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: Partial<DrivingSchool>): Observable<DrivingSchool> {
    return this.http.put<DrivingSchool>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}