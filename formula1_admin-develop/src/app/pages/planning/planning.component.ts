import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { PlanningService } from '../../services/planning.service';
import { InstructorService } from '../../services/instructor.service';
import { CandidateService } from '../../services/candidate.service';

// Pour manipuler les modales Bootstrap 5 via JS
declare var bootstrap: any;

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  // --- DONNÉES ---
  schedules: any[] = [];      // Disponibilités (zones colorées)
  sessions: any[] = [];       // Réservations (boîtes noires/oranges)
  allInstructors: any[] = []; 
  allCandidates: any[] = [];   

  // --- FILTRES & RECHERCHE ---
  instructorSearchText: string = '';  
  candidateSearchText: string = '';   
  selectedFilterInstructor: number | null = null;
  selectedCandidate: any = null;

  // --- CONFIGURATION CALENDRIER ---
  jours: string[] = [];
  joursDates: Date[] = [];
  heures: number[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  currentDate: Date = new Date();
  currentMondayISO: string = ''; // Sera le Samedi (début de semaine)[cite: 5]

  // --- ÉTATS MODALES & FORMULAIRES ---
  selectedSession: any = null;
  isEditMode: boolean = false;
  isTimeValid: boolean = true; 

  sessionForm: any = {
    startTime: '',
    endTime: '',
    typeSession: 'conduite',
    candidateId: null,
    instructorId: null,
    candidate_name: '', 
    status: 'Planifiée'
  };

  constructor(
    private sessionService: SessionService,
    private planningService: PlanningService,
    private instructorService: InstructorService,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    this.updateWeekDays();
    this.loadInitialData();
  }

  // 1. Initialisation avec Debug
  loadInitialData() {
    this.instructorService.getAll().subscribe({
      next: (data: any) => {
        this.allInstructors = Array.isArray(data)
          ? data
          : (data.instructors || data.records || data.data || []);
        this.syncSelectedCandidateInstructor();
      },
      error: (err) => console.error('Erreur moniteurs:', err)
    });

    this.candidateService.getAllCandidates().subscribe({
      next: (data: any) => {
        this.allCandidates = Array.isArray(data)
          ? data
          : (data.candidates || data.records || data.data || []);
        this.syncSelectedCandidateInstructor();
      },
      error: (err) => console.error('Erreur candidats:', err)
    });
  }

  // 2. Sélection automatique du moniteur liée au candidat
  onCandidateSelect() {
    const found = this.allCandidates.find(c => 
      this.getDisplayName(c).toLowerCase() === this.candidateSearchText.toLowerCase()
    );

    if (found) {
      this.selectedCandidate = found;
      this.sessionForm.candidateId = found.id;
      this.sessionForm.candidate_name = this.getDisplayName(found);
      
      const instructorId = this.getCandidateInstructorId(found);
      if (instructorId) {
        this.selectedFilterInstructor = instructorId;
        
        const inst = this.allInstructors.find(i => i.id === instructorId);
        if (inst) {
          this.instructorSearchText = this.getDisplayName(inst);
        }
        this.loadPlanningData(); 
      }
    }
  }

  // 3. Changement manuel du moniteur
  onInstructorSelect() {
    const found = this.allInstructors.find(m => 
      this.getDisplayName(m).toLowerCase() === this.instructorSearchText.toLowerCase()
    );

    if (found) {
      this.selectedFilterInstructor = found.id;
      this.loadPlanningData();
    } else {
      this.selectedFilterInstructor = null;
      this.schedules = [];
      this.sessions = [];
    }
  }

  selectCandidate(candidate: any) {
    this.selectedCandidate = candidate;
    this.sessionForm.candidateId = candidate.id;
    this.sessionForm.candidate_name = this.getDisplayName(candidate);
    
    const instructorId = this.getCandidateInstructorId(candidate);
    if (instructorId) {
      this.selectedFilterInstructor = instructorId;
      const instructor = this.allInstructors.find(i => i.id === instructorId);
      if (instructor) {
        this.instructorSearchText = this.getDisplayName(instructor);
      }
      this.loadPlanningData();
    }
  }

  private syncSelectedCandidateInstructor() {
    if (!this.selectedCandidate || this.selectedFilterInstructor) return;
    const instructorId = this.getCandidateInstructorId(this.selectedCandidate);
    if (!instructorId) return;

    const instructor = this.allInstructors.find(i => i.id === instructorId);
    if (instructor) {
      this.selectedFilterInstructor = instructorId;
      this.instructorSearchText = this.getDisplayName(instructor);
      this.loadPlanningData();
    }
  }

  private getCandidateInstructorId(candidate: any): number | null {
    return candidate?.instructorId || candidate?.instructor_id || candidate?.moniteurId || null;
  }

  getDisplayName(item: any): string {
    if (!item) return '';
    const first = item.firstName || item.prenom || item.first_name || '';
    const last = item.lastName || item.nom || item.last_name || '';
    return `${first} ${last}`.trim();
  }

  // --- LOGIQUE PLANNING ---

  loadPlanningData() {
    if (!this.selectedFilterInstructor || !this.currentMondayISO) {
      this.schedules = [];
      this.sessions = [];
      return;
    }

    // Ajout de currentMondayISO pour éviter l'erreur "Date de début de semaine manquante"[cite: 5]
    this.planningService.getByInstructor(this.selectedFilterInstructor, this.currentMondayISO).subscribe({
      next: (data: any) => {
        this.schedules = Array.isArray(data)
          ? data
          : (data.records || data.data || []);
      },
      error: (err) => console.error('Erreur planning:', err)
    });

    const sessionQuery = `?instructorId=${this.selectedFilterInstructor}&startOfWeek=${this.currentMondayISO}`;
    this.sessionService.getAll(sessionQuery).subscribe({
      next: (data: any) => {
        this.sessions = Array.isArray(data)
          ? data
          : (data.records || data.data || []);
      },
      error: (err) => console.error('Erreur sessions:', err)
    });
  }

  private getSessionInstructorId(item: any): number | null {
    return item?.instructorId || item?.instructor_id || null;
  }

  private getScheduleTime(item: any, key: 'startTime' | 'endTime'): string {
    if (!item) return '';
    if (key === 'startTime') return item.startTime || item.start_time || '';
    return item.endTime || item.end_time || '';
  }

  // Fonctions de filtrage pour le rendu HTML
  getFilteredSessionsForDay(jourLabel: string): any[] {
    const idx = this.jours.indexOf(jourLabel);
    const dateCible = this.joursDates[idx];
    if (!dateCible || !this.sessions) return [];
    return this.sessions.filter(s => new Date(s.startTime).toDateString() === dateCible.toDateString());
  }

  getFilteredSchedulesForDay(jourLabel: string): any[] {
    const idx = this.jours.indexOf(jourLabel);
    if (idx === -1) return [];
    
    // Aligné sur Samedi = 1, Dimanche = 2, etc.[cite: 5]
    const targetDayInDB = idx + 1; 
    return this.schedules.filter(s => Number(s.scheduleDay) === targetDayInDB);
  }

  // --- NAVIGATION CALENDRIER (SAMEDI A VENDREDI) ---

  updateWeekDays() {
    this.jours = [];
    this.joursDates = [];
    const noms = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    let tempDate = new Date(this.currentDate);
    let day = tempDate.getDay(); 
    
    // Calcul pour commencer la semaine le Samedi[cite: 5]
    let diffToSaturday = (day === 6) ? 0 : -(day + 1); 
    
    let saturday = new Date(tempDate);
    saturday.setDate(tempDate.getDate() + diffToSaturday);
    saturday.setHours(0, 0, 0, 0);

    this.currentMondayISO = saturday.toISOString().split('T')[0]; 

    for (let i = 0; i < 7; i++) {
      let d = new Date(saturday);
      d.setDate(saturday.getDate() + i);
      this.jours.push(`${noms[d.getDay()]} ${d.getDate()}`);
      this.joursDates.push(d);
    }
  }

  prevWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.updateWeekDays();
    this.loadPlanningData();
  }

  nextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.updateWeekDays();
    this.loadPlanningData();
  }

  onDateChange(event: any) {
    this.currentDate = new Date(event.target.value);
    this.updateWeekDays();
    this.loadPlanningData();
  }

  // --- GESTION DES CLICS & MODALES ---

handleSlotClick(plan: any, jourLabel: string) {
  if (!this.selectedCandidate) {
    alert("Veuillez sélectionner un candidat avant de réserver.");
    return;
  }

  const idx = this.jours.indexOf(jourLabel);
  if (idx === -1) return;

  const dateBase = new Date(this.joursDates[idx]);

  // === Récupération de l'heure du créneau cliqué ===
  let startTimeStr = '';
  
  if (plan.startTime) startTimeStr = plan.startTime;
  else if (plan.start_time) startTimeStr = plan.start_time;
  else if (plan.StartTime) startTimeStr = plan.StartTime;

  if (startTimeStr) {
    // Prendre seulement les 5 premiers caractères (HH:mm)
    const timePart = startTimeStr.toString().substring(0, 5);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    dateBase.setHours(hours, minutes || 0, 0, 0);
  } else {
    dateBase.setHours(9, 0, 0, 0); // heure par défaut si problème
  }

  this.sessionForm.startTime = this.formatDateForInput(dateBase);

  // Fin = début + 1 heure
  const dateFin = new Date(dateBase);
  dateFin.setHours(dateFin.getHours() + 1);
  this.sessionForm.endTime = this.formatDateForInput(dateFin);

  // Reste des infos
  this.sessionForm.instructorId = this.getSessionInstructorId(plan);
  this.sessionForm.candidateId = this.selectedCandidate.id;
  this.sessionForm.candidate_name = this.getDisplayName(this.selectedCandidate);
  this.sessionForm.typeSession = this.normalizeTypeWork(this.getScheduleTypeWork(plan));

  // Ouvrir le modal
  const modalElem = document.getElementById('reservationModal');
  if (modalElem) {
    new bootstrap.Modal(modalElem).show();
  }
}
onSessionClick(session: any) {
  this.selectedSession = { ...session };

  // === FORMATAGE IMPORTANT POUR datetime-local ===
  if (this.selectedSession) {
    let start = this.selectedSession.startTime || this.selectedSession.start_time;
    let end = this.selectedSession.endTime || this.selectedSession.end_time;

    if (start) {
      this.selectedSession.startTime = this.formatDateForInput(new Date(start));
    }
    if (end) {
      this.selectedSession.endTime = this.formatDateForInput(new Date(end));
    }
  }

  this.isEditMode = false;

  const modalElem = document.getElementById('detailsModal');
  if (modalElem) {
    const modal = new bootstrap.Modal(modalElem);
    modal.show();
  }
}


  // --- ACTIONS API ---

 saveSession() {
  this.sessionService.create(this.sessionForm).subscribe({
    next: () => {
      this.loadPlanningData();
      bootstrap.Modal.getInstance(document.getElementById('reservationModal'))?.hide();
      alert('✅ Séance réservée avec succès !');
    },
  error: (err) => {
  const errorMsg = err.error?.message || err.message || '';
  console.log("[DEBUG] Message reçu du serveur :", errorMsg);

  if (errorMsg.toLowerCase().includes("code") || errorMsg.toLowerCase().includes("créneau")) {
    
    // 1. Fermer d'abord proprement la modale noire
    const resModalElem = document.getElementById('reservationModal');
    if (resModalElem) {
      const resInstance = bootstrap.Modal.getInstance(resModalElem);
      if (resInstance) resInstance.hide();
    }

    // 2. On attend 200ms (fin de l'animation de fermeture) avant d'ouvrir la rouge !
    setTimeout(() => {
      const errorModalElem = document.getElementById('codeRequiredModal');
      if (errorModalElem) {
        let errorInstance = bootstrap.Modal.getInstance(errorModalElem);
        if (!errorInstance) {
          errorInstance = new bootstrap.Modal(errorModalElem, {
            backdrop: 'static',
            keyboard: false
          });
        }
        errorInstance.show(); // Là, elle va s'ouvrir sans bugger !
      }
    }, 200); // 200ms pour être totalement sécurisé

  } else {
    alert(errorMsg || 'Erreur lors de la réservation');
  }
}
  });
 
}
closeCodeRequiredModal() {
  const errorModalElem = document.getElementById('codeRequiredModal');
  if (errorModalElem) {
    const errorInstance = bootstrap.Modal.getInstance(errorModalElem);
    if (errorInstance) errorInstance.hide();
  }

  // Nettoyage forcé de sécurité pour éliminer le fond noir persistant
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';

  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());
}
// Cette fonction ferme la modale d'erreur ET supprime le fond noir bloquant

  updateSession() {
    this.sessionService.update(this.selectedSession.id, this.selectedSession).subscribe(() => {
      this.loadPlanningData();
      this.isEditMode = false;
      bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();
    });
  }

  deleteSessionConfirm() {
    const modalElem = document.getElementById('confirmDeleteModal');
    if (modalElem) {
      const modal = new bootstrap.Modal(modalElem);
      modal.show();
    }
  }

  deleteSession() {
    if (!this.selectedSession?.id) return;
    this.sessionService.delete(this.selectedSession.id).subscribe(() => {
      this.loadPlanningData();
      bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'))?.hide();
      bootstrap.Modal.getInstance(document.getElementById('detailsModal'))?.hide();
    });
  }

  // --- HELPERS ---

  getScheduleStyles(s: any) {
    const startString = this.getScheduleTime(s, 'startTime');
    const endString = this.getScheduleTime(s, 'endTime');
    const start = startString.split(':');
    const end = endString.split(':');
    const top = (parseInt(start[0]) - 7) * 60 + parseInt(start[1]);
    const height = (parseInt(end[0]) * 60 + parseInt(end[1])) - (parseInt(start[0]) * 60 + parseInt(start[1]));
    return { 'top.px': top, 'height.px': height };
  }

  getEventStyles(s: any) {
    const start = new Date(s.startTime || s.start_time);
    const end = new Date(s.endTime || s.end_time);
    const top = (start.getHours() - 7) * 60 + start.getMinutes();
    const height = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
    return { 'top.px': top, 'height.px': height, 'position': 'absolute', 'width': '100%', 'z-index': '10' };
  }

  getScheduleColorClass(t: any) {
    const type = (t || '').toString().toLowerCase();
    if (type.includes('code')) return 'bg-dark-blue';
    if (type.includes('conduite')) return 'bg-dark-amber';
    return 'bg-dark-green';
  }

  normalizeTypeWork(typeWork: any): string {
    if (!typeWork) return 'conduite';
    const normalized = typeWork.toString().toLowerCase().trim();
    if (normalized.includes('code')) return 'code';
    if (normalized.includes('conduite')) return 'conduite';
    if (normalized.includes('creneau') || normalized.includes('créneau')) return 'creneau';
    return normalized || 'conduite';
  }

  private getScheduleTypeWork(plan: any): string | null {
    return plan?.typeWork || plan?.typework || plan?.typeSession || null;
  }

  getCandidateName(s: any) {
    if (s?.candidate) return this.getDisplayName(s.candidate);
    if (s?.candidate_name || s?.candidateName) return s.candidate_name || s.candidateName;
    return 'Inconnu';
  }

  formatDateForInput(d: Date): string {
    return d.toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16);
  }

  checkValidation() { this.isTimeValid = true; }
  // ====================== VÉRIFICATION PHASE ======================
private showCodeRequiredModal() {
  // 1. FORCER la fermeture de la modale noire sans passer par l'instance Bootstrap qui bugge
  const resModalElem = document.getElementById('reservationModal');
  if (resModalElem) {
    resModalElem.classList.remove('show');
    resModalElem.style.display = 'none';
    resModalElem.setAttribute('aria-hidden', 'true');
  }

  // 2. NETTOYER immédiatement le fond noir de la première modale
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());

  // 3. OUVRIR la modale rouge proprement après un mini-délai
  setTimeout(() => {
    const errorModalElem = document.getElementById('codeRequiredModal');
    if (errorModalElem) {
      const errorModal = new bootstrap.Modal(errorModalElem, {
        backdrop: 'static',
        keyboard: false
      });
      errorModal.show();
    }
  }, 100);
}


}