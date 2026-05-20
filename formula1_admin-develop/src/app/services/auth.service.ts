// FILE: src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_CONFIG.apiUrl;   // e.g. http://localhost:3400/api

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    return this.http.get(`${this.apiUrl}/auth/me`).pipe(
      map((response: any) => response?.user ?? response),
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null; 
    // Assurez-vous que votre objet 'user' renvoyé par le backend contient bien une propriété 'role'
  }

  // Optionnel : une méthode d'aide
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }
}
