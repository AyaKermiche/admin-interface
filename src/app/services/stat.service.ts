import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config'; // Assure-toi de l'import

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  // Correction ici : pas de guillemets autour des backticks
  private apiUrl = `${API_CONFIG.apiUrl}/dashboard`; 

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    // Appel direct à l'URL : http://localhost:3500/api/dashboard
    return this.http.get(this.apiUrl);
  }
}