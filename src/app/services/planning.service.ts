import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private apiUrl = `${API_CONFIG.apiUrl}/planning`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les plannings (Vue globale)
   * @param startOfWeek Optionnel: Date au format YYYY-MM-DD
   */
  getAll(startOfWeek?: string): Observable<any> {
    let params = new HttpParams();
    if (startOfWeek) {
      params = params.set('startOfWeek', startOfWeek); //
    }
    return this.http.get(this.apiUrl, { params });
  }

  /**
   * Récupère le planning d'un moniteur spécifique pour une semaine donnée
   * @param instructorId ID du moniteur
   * @param startOfWeek Date du Samedi au format YYYY-MM-DD[cite: 4]
   */
  getByInstructor(instructorId: number, startOfWeek?: string): Observable<any> {
    let params = new HttpParams();
    if (startOfWeek) {
      params = params.set('startOfWeek', startOfWeek); //[cite: 6]
    }
    return this.http.get(`${this.apiUrl}/${instructorId}`, { params });
  }

  /**
   * Crée un nouveau créneau ou un planning complet
   */
  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Met à jour le planning d'une semaine spécifique pour un moniteur
   * @param instructorId ID du moniteur
   * @param schedules Tableau des nouveaux créneaux
   * @param startOfWeek La date de référence pour le nettoyage de la base[cite: 5]
   */
  // Dans planning.service.ts
// Remplace la définition actuelle par celle-ci
update(id: number, data: any[]): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, data);
}
  /**
   * Supprime un créneau spécifique par son ID technique
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}