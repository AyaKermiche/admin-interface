import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanningService } from '../../services/planning.service';
import { InstructorService } from '../../services/instructor.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({ 
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-planning-moniteur',
  templateUrl: './planning-moniteur.component.html',
  styleUrls: ['./planning-moniteur.component.scss']
})
export class PlanningMoniteurComponent implements OnInit {
  // --- Propriétés ---
  instructorId!: number;
  instructorName: string = 'Chargement...';
  currentPlanning: any[] = []; 
  daysInPlanning: any[] = [];  
  selectedWeekStart!: string; 

  tempSlot: any = { startTime: '08:00', endTime: '09:00', typeWork: 'conduite' };
  editingSlot: any = null;
  selectedDayIndex: number = 1; 
  selectedDayToAdd: number = 1;

  feedbackTitle: string = '';
  feedbackMessage: string = '';
  feedbackType: 'success' | 'danger' = 'success';

  // Samedi = Index 1 (Logique Algérie / Backend)[cite: 4]
  weekDays = [
    { index: 1, label: 'S', fullName: 'Samedi' },
    { index: 2, label: 'D', fullName: 'Dimanche' },
    { index: 3, label: 'L', fullName: 'Lundi' },
    { index: 4, label: 'M', fullName: 'Mardi' },
    { index: 5, label: 'M', fullName: 'Mercredi' },
    { index: 6, label: 'J', fullName: 'Jeudi' },
    { index: 7, label: 'V', fullName: 'Vendredi' }
  ];

  constructor(
    private route: ActivatedRoute,
    private planningService: PlanningService,
    private instructorService: InstructorService 
  ) {}

  ngOnInit() {
    this.instructorId = Number(this.route.snapshot.paramMap.get('id'));
    // On se cale sur le Samedi de la semaine actuelle[cite: 4]
    this.selectedWeekStart = this.getSaturday(new Date()).toISOString().split('T')[0];

    if (this.instructorId) {
      this.loadInstructorInfo();
      this.loadPlanning();
    }
  }

  // --- LOGIQUE DES DATES ---

  getSaturday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay(); 
    const diff = date.getDate() - (day === 6 ? 0 : day + 1);
    const saturday = new Date(date.setDate(diff));
    saturday.setHours(12, 0, 0, 0); 
    return saturday;
  }

  get availableDaysToAdd() {
    return this.weekDays.filter(day => 
      !this.daysInPlanning.some(d => d.index === day.index)
    );
  }

  // --- ACTIONS PRINCIPALES ---

  

  confirmCancel() {
    this.loadPlanning(); // Recharge les données depuis le serveur
  }

saveAllChanges() {
  const formattedSchedules = this.currentPlanning.map(slot => {
    const slotDate = new Date(this.selectedWeekStart);
    
    // On calcule la date exacte : Samedi + (index du jour - 1)[cite: 4, 5]
    slotDate.setDate(slotDate.getDate() + (Number(slot.scheduleDay) - 1));

    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      instructorId: this.instructorId,
      scheduleDay: Number(slot.scheduleDay),
      typeWork: slot.typeWork,
      isAvailable: slot.isAvailable ?? true,
      scheduleDate: slotDate.toISOString() // ✅ C'est le champ vital pour Prisma
    };
  });

  // ENVOIE DIRECTEMENT LE TABLEAU (formattedSchedules)
  this.planningService.update(this.instructorId, formattedSchedules).subscribe({
    next: () => {
      this.showFeedbackModal('success', 'Succès', 'Planning enregistré avec succès.');
      this.loadPlanning();
    },
    error: (err) => {
      console.error('Erreur sauvegarde:', err);
      this.showFeedbackModal('danger', 'Erreur', 'Erreur lors de la sauvegarde.');
    }
  });
}
  // --- GESTION DES CRÉNEAUX (SLOTS) ---

  openTimeSlotModal(dayIndex: number) {
    this.selectedDayIndex = dayIndex;
    this.tempSlot = { startTime: '08:00', endTime: '09:00', typeWork: 'conduite' };
  }

  confirmAddTimeSlot() {
    const newSlot = { 
      ...this.tempSlot, 
      scheduleDay: this.selectedDayIndex, 
      instructorId: this.instructorId 
    };
    this.currentPlanning.push(newSlot);
    this.currentPlanning.sort((a, b) => a.startTime.localeCompare(b.startTime));
    this.updateVisibleDays();
  }

  openEditSlotModal(slot: any) {
    this.editingSlot = slot;
    this.tempSlot = { ...slot }; // On copie les valeurs dans tempSlot pour la modale
  }

  confirmEditSlot() {
    if (this.editingSlot) {
      Object.assign(this.editingSlot, this.tempSlot); // Met à jour le créneau original
      this.currentPlanning.sort((a, b) => a.startTime.localeCompare(b.startTime));
      this.editingSlot = null;
    }
  }

  removeSlot(slot: any) {
    this.currentPlanning = this.currentPlanning.filter(s => s !== slot);
    this.updateVisibleDays();
  }

  confirmAddDay() {
    const dayIndex = Number(this.selectedDayToAdd);
    const dayObj = this.weekDays.find(d => d.index === dayIndex);
    if (dayObj && !this.daysInPlanning.find(d => d.index === dayIndex)) {
      this.daysInPlanning.push(dayObj);
      this.daysInPlanning.sort((a, b) => a.index - b.index);
    }
  }

  // --- UTILITAIRES ---

  updateVisibleDays() {
    const activeIndexes = [...new Set(this.currentPlanning.map(p => Number(p.scheduleDay)))];
    this.daysInPlanning = this.weekDays.filter(d => activeIndexes.includes(d.index));
    this.daysInPlanning.sort((a, b) => a.index - b.index);
  }

  getSlotsForDay(dayIndex: number) {
    return this.currentPlanning.filter(p => Number(p.scheduleDay) === dayIndex);
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '08:00';
    return timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : timeStr.substring(0, 5);
  }

  getDayName(index: number) {
    return this.weekDays.find(d => d.index === index)?.fullName || '';
  }

  loadInstructorInfo() {
    this.instructorService.getById(this.instructorId).subscribe({
      next: (res: any) => this.instructorName = `${res.firstName || ''} ${res.lastName || ''}`.trim()
    });
  }

  loadPlanning() {
    this.planningService.getByInstructor(this.instructorId, this.selectedWeekStart).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.records || []);
        this.currentPlanning = data.map((slot: any) => ({
          ...slot,
          startTime: this.formatTime(slot.startTime),
          endTime: this.formatTime(slot.endTime)
        }));
        this.updateVisibleDays();
      }
    });
  }

  private showFeedbackModal(type: 'success' | 'danger', title: string, message: string): void {
    this.feedbackType = type; this.feedbackTitle = title; this.feedbackMessage = message;
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    modal.show();
  } 
  copyPreviousWeek() {
    // 1. Calcul de la date du samedi de la semaine passée (-7 jours)
    const lastSat = new Date(this.selectedWeekStart);
    lastSat.setDate(lastSat.getDate() - 7);
    const lastSatStr = lastSat.toISOString().split('T')[0];

    // 2. Appel au service pour récupérer le planning de cette date précise
    this.planningService.getByInstructor(this.instructorId, lastSatStr).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.records || res.data || []);
        
        if (data.length > 0) {
          // 3. Transformation des données pour la nouvelle semaine
          this.currentPlanning = data.map((slot: any) => ({
            instructorId: this.instructorId,
            scheduleDay: Number(slot.scheduleDay),
            typeWork: slot.typeWork || 'conduite',
            isAvailable: slot.isAvailable ?? true,
            startTime: this.formatTime(slot.startTime),
            endTime: this.formatTime(slot.endTime),
            // On NE copie PAS l'id ni la scheduleDate pour permettre une nouvelle insertion
          }));

          this.updateVisibleDays();
          this.showFeedbackModal('success', 'Planning récupéré', 'Le planning de la semaine passée a été chargé. Cliquez sur Enregistrer pour confirmer.');
        } else {
          this.showFeedbackModal('danger', 'Aucun planning', 'Aucun créneau trouvé pour la semaine précédente.');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération:', err);
        this.showFeedbackModal('danger', 'Erreur', 'Impossible de récupérer le planning précédent.');
      }
    });
  }
}