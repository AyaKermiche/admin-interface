import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { SessionService } from '../../services/session.service';
import { CandidateService } from '../../services/candidate.service';
import { InstructorService } from '../../services/instructor.service';
import { ExamService } from '../../services/exam.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Données d'affichage
  sessionsToday: any[] = [];
  examsWeek: any[] = []; 
  allCandidates: any[] = [];
  allInstructors: any[] = [];
  loading: boolean = true;

  // Formulaire Nouveau Candidat
  form: any = {
    firstName: '',
    lastName: '',
    birthDate: '',
    registrationDate: new Date().toISOString().split('T')[0],
    phone: '',
    email: '',  
    address: '', 
    licenseType: 'B',
    bloodType: 'A+',
    drivingSchoolId: 1,
    totalPrice: 0
  };
  instructorName: string = '';
  adminName: string = '';

  // Formulaire Nouveau Paiement
  newPayment: any = {
    candidateId: null,
    amount: null,
    payment_time: new Date().toISOString().slice(0, 16)
  };
  searchCandidateText: string = '';
  showSuggestions: boolean = false;
  filteredCandidates: any[] = [];

  constructor( 
    private authService : AuthService,
    private sessionService: SessionService,
    private candidateService: CandidateService,
    private instructorService: InstructorService,
    private examService: ExamService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData(); 
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.adminName = user.firstName; 
      }
    });
  }

  /**
   * Charge toutes les données nécessaires au Dashboard
   */
  loadDashboardData(): void {
    this.loading = true;
    const now = new Date();
    
    // --- 1. SESSIONS (Aujourd'hui) ---
    // Utilisation de la méthode simplifiée qui délègue le filtrage au backend[cite: 5]
    const sessionsRequest = this.sessionService.getToday();

    // --- 2. EXAMENS (Plage dynamique) ---
    // Calcul pour obtenir le Dimanche (début de semaine) et le Samedi suivant (fin de semaine)
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay()); 
    const startWeek = sunday.toISOString().split('T')[0];
    
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const endWeek = saturday.toISOString().split('T')[0];
    
    // Format attendu par ton API : localhost:3500/api/exam?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD[cite: 6]
    const examFilters = `?startDate=${startWeek}&endDate=${endWeek}`;

    forkJoin({
      sessions: sessionsRequest,
      exams: this.examService.getAll(examFilters),
      candidates: this.candidateService.getAllCandidates(),
      instructors: this.instructorService.getAll()
    }).subscribe({
      next: (res: any) => {
        // Extraction flexible des données[cite: 6]
        this.sessionsToday = Array.isArray(res.sessions) ? res.sessions : (res.sessions?.records || []);
        this.examsWeek = Array.isArray(res.exams) ? res.exams : (res.exams?.records || []);
        this.allCandidates = Array.isArray(res.candidates) ? res.candidates : (res.candidates?.records || []);
        this.allInstructors = Array.isArray(res.instructors) ? res.instructors : (res.instructors?.records || []);
        
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur lors du chargement du Dashboard :", err);
        this.loading = false;
      }
    });
  }

  /**
   * Retourne le nom complet pour l'affichage
   */
  getDisplayName(person: any): string {
    if (!person) return '';
    return `${person.firstName} ${person.lastName}`.trim();
  }

  /**
   * Création d'un candidat
   */
  addCandidat(): void {
    const selectedIns = this.allInstructors.find(
      ins => this.getDisplayName(ins).toLowerCase() === this.instructorName.toLowerCase()
    );
    
    const payload = { 
      ...this.form, 
      instructorId: selectedIns ? selectedIns.id : null 
    };

    this.candidateService.createCandidate(payload).subscribe({
      next: () => {
        this.resetCandidatForm();
        this.loadDashboardData();
      },
      error: (err) => console.error("Erreur création candidat :", err)
    });
  }

  resetCandidatForm(): void {
    this.form = {
      firstName: '', lastName: '', birthDate: '',
      registrationDate: new Date().toISOString().split('T')[0],
      phone: '', email: '', licenseType: 'B', bloodType: 'A+',
      address: '', totalPrice: 0
    };
    this.instructorName = '';
  }

  onSearchCandidate(): void {
    const search = this.searchCandidateText.toLowerCase();
    if (search.length > 1) {
      this.showSuggestions = true;
      this.filteredCandidates = this.allCandidates.filter(c => 
        this.getDisplayName(c).toLowerCase().includes(search)
      );
    } else {
      this.showSuggestions = false;
    }
  }

  selectCandidate(c: any): void {
    this.newPayment.candidateId = c.id;
    this.searchCandidateText = this.getDisplayName(c);
    this.showSuggestions = false;
  }

  savePaiement(): void {
    if (!this.newPayment.candidateId || !this.newPayment.amount) {
      alert("Veuillez sélectionner un candidat et un montant.");
      return;
    }

    this.paymentService.create(this.newPayment).subscribe({
      next: () => {
        this.searchCandidateText = '';
        this.newPayment = { 
          candidateId: null, 
          amount: null, 
          paymentTime: new Date().toISOString().slice(0, 16) 
        };
        this.loadDashboardData();
      },
      error: (err) => console.error("Erreur enregistrement paiement :", err)
    });
  }
}