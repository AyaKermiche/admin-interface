import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { InstructorService } from '../../services/instructor.service';

declare var bootstrap: any;

@Component({
  selector: 'app-gestion-candidat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-candidat.component.html',
  styleUrls: ['./gestion-candidat.component.scss']
})
export class GestionCandidatComponent implements OnInit {

  candidats: any[] = [];
  instructors: any[] = []; 
  searchTerm: string = '';
  instructorName: string = ''; // Pour lier la datalist (Nom Prénom)

  form: any = this.getEmptyForm();
  selectedCandidat: any = null;

  constructor(
    private candidateService: CandidateService, 
    private instructorService: InstructorService
  ) {}

  ngOnInit(): void {
    // Charger les moniteurs EN PREMIER pour que loadCandidates puisse mapper les noms
    this.loadInstructors();
  }

  private getEmptyForm() {
    return {
      firstName: '',
      lastName: '',
      birthDate: '',
      email: '',
      phone: '',
      licenseType: 'B',
      bloodType: 'O+',
      address: '',
      phase: '',
      instructorId: 1,
      drivingSchoolId: 1,
      totalPrice: 0,
      registrationDate: new Date().toISOString().split('T')[0]
    };
  }


  
  loadInstructors(): void {
    this.instructorService.getAll().subscribe({
      next: (data: any) => {
        this.instructors = Array.isArray(data) ? data : (data.records || data.data || []);
        // Une fois les moniteurs chargés, on charge les candidats
        this.loadCandidates();
      },
      error: (err) => console.error('Erreur chargement moniteurs:', err)
    });
  }

  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (data: any) => {
        const rawData = Array.isArray(data) ? data : (data.data || data.records || data || []);
        
        this.candidats = rawData.map((item: any) => {
          // Trouver le moniteur correspondant pour afficher son NOM dans le tableau/view
          const instructor = this.instructors.find(ins => ins.id === (item.instructorId || item.instructor_id));
          
          return {
            id: item.id,
            firstName: item.firstName || item.first_name || '',
            lastName: item.lastName || item.last_name || '',
            email: item.email,
            birthDate: item.birthDate || item.birth_date,
            registrationDate: item.registrationDate || item.registration_date,
            phone: item.phone,
            licenseType: item.licenseType || item.license_type,
            bloodType: item.bloodType || item.blood_type,
            address: item.address,
            phase: item.phase,
            instructorId: item.instructorId || item.instructor_id,
            // Propriété calculée pour la vue
            instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Non assigné',
            drivingSchoolId: item.drivingSchoolId || item.driving_school_id,
            totalPrice: item.totalPrice || item.total_price
          };
        });
      },
      error: (err) => {
        console.error('❌ Error loading candidates:', err);
        this.candidats = [];
      }
    });
  }

  // Transforme le texte de l'input "Nom Prénom" en ID numérique
  findInstructorId(): void {
    const selected = this.instructors.find(ins => 
      `${ins.firstName} ${ins.lastName}` === this.instructorName
    );
    if (selected) {
      this.form.instructorId = selected.id;
    }
  }

  // Feedback modal state
  feedbackTitle: string = '';
  feedbackMessage: string = '';
  feedbackType: 'success' | 'danger' = 'success';

  // ==================== ADD CANDIDAT ====================
  addCandidat(): void {
    this.findInstructorId(); // Conversion Nom -> ID

    const payload = {
      ...this.form,
     
      instructorId: Number(this.form.instructorId),
      drivingSchoolId: Number(this.form.drivingSchoolId),
      totalPrice: Number(this.form.totalPrice) || 0
    };

    this.candidateService.createCandidate(payload).subscribe({
      next: () => {
        this.loadCandidates();
        this.instructorName = '';
        this.form = this.getEmptyForm();
        this.closeModal('addEmployeModal');
        this.showFeedbackModal('success', 'Candidat ajouté', 'Le candidat a bien été ajouté.');
      },
      error: (err: any) => {
        const message = this.extractBackendError(err) || 'Impossible d\'ajouter le candidat. Veuillez vérifier le formulaire et réessayer.';
        this.showFeedbackModal('danger', 'Erreur', message);
      }
    });
  }

  // ==================== UPDATE ====================
  updateCandidat(): void {
    if (!this.form.id) return;

    this.findInstructorId(); // Conversion Nom -> ID avant le PUT

    const payload = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      birthDate: this.form.birthDate,
      email: this.form.email || null,
      phone: this.form.phone || null,
      licenseType: this.form.licenseType,
      bloodType: this.form.bloodType,
      address: this.form.address || null,
      phase: this.form.phase ,
      instructorId: Number(this.form.instructorId),
      drivingSchoolId: Number(this.form.drivingSchoolId),
      totalPrice: Number(this.form.totalPrice) || 0
    };

    this.candidateService.updateCandidate(this.form.id, payload).subscribe({
      next: () => {
        this.loadCandidates();
        this.instructorName = '';
        this.closeModal('modifyCandidatModal');
        this.showFeedbackModal('success', 'Candidat modifié', 'Les modifications ont bien été enregistrées.');
      },
      error: (err: any) => {
        const message = this.extractBackendError(err) || 'Impossible de modifier le candidat. Veuillez réessayer.';
        this.showFeedbackModal('danger', 'Erreur', message);
      }
    });
  }

  private extractBackendError(err: any): string | null {
    if (!err) return null;
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error.message === 'string') return err.error.message;
      if (Array.isArray(err.error) && err.error.length) return String(err.error[0]);
    }
    if (typeof err.message === 'string') return err.message;
    return null;
  }

  private showFeedbackModal(type: 'success' | 'danger', title: string, message: string): void {
    this.feedbackType = type;
    this.feedbackTitle = title;
    this.feedbackMessage = message;

    const modalEl = document.getElementById('feedbackModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // ==================== MODALS & HELPERS ====================
  viewCandidat(c: any): void {
    this.selectedCandidat = { ...c };
  }

  openEditModal(c: any): void {
    this.form = { ...c };
    // Pré-remplir le champ texte du moniteur pour l'édition
    const instructor = this.instructors.find(ins => ins.id === c.instructorId);
    this.instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : '';
  }

  openDeleteModal(c: any): void {
    this.selectedCandidat = { ...c };
  }

  deleteCandidat(id: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce candidat ?')) return;
    this.candidateService.deleteCandidate(id).subscribe({
      next: () => {
        alert('Candidat supprimé avec succès');
        this.loadCandidates();
        this.closeModal('deleteCandidatModal');
      }
    });
  }

  getFilteredCandidats(): any[] {
    if (!this.searchTerm.trim()) return this.candidats;
    const term = this.searchTerm.toLowerCase();
    return this.candidats.filter(c => 
      (c.firstName || '').toLowerCase().includes(term) || 
      (c.lastName || '').toLowerCase().includes(term)
    );
  }

  private closeModal(modalId: string): void {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }
}