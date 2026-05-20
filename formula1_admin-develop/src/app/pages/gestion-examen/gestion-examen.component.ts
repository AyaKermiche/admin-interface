import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-gestion-examen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-examen.component.html',
  styleUrl: './gestion-examen.component.scss'
})
export class GestionExamenComponent implements OnInit {

  exams: any[] = [];
  allCandidates: any[] = [];
  searchTerm: string = '';
  isEditMode = false;
  examToDelete: any = null;

  newExam: any = {
    candidateId: null,
    examDate: '',
    examType: 'Code',
    status: 'En attente'
  };

  selectedCandidateName: string = '';
  selectedCandidateEmail: string = '';

  constructor(
    private examService: ExamService,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    this.loadExams();
    this.loadAllCandidates();
  }

  loadExams(): void {
    const joinParams = '?join=candidate';

    this.examService.getAll(joinParams).subscribe({
      next: (response: any) => {
        let rawData = Array.isArray(response) ? response : (response.records || []);

        this.exams = rawData
          .map((ex: any) => {
            const normalizedStatus = this.normalizeStatusForDisplay(ex.status);
            return {
              ...ex,
              status: normalizedStatus,           // ← Important pour le badge
              displayStatus: normalizedStatus,    // ← Pour le texte affiché
              examType: ex.examType || ex.exam_type || 'N/A',
              examDate: ex.examDate || ex.exam_date || '',
            };
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.examDate || a.exam_date || 0);
            const dateB = new Date(b.examDate || b.exam_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
      },
      error: (err) => console.error('❌ Error loading exams:', err)
    });
  }

  // Normalisation pour le badge + affichage
  private normalizeStatusForDisplay(status: any): string {
    if (!status) return 'En attente';

    const s = String(status).toLowerCase().trim();

    if (s.includes('réussi') || s.includes('reussi') || s.includes('success')) {
      return 'réussi';
    }
    if (s.includes('échoué') || s.includes('echoue') || s.includes('echec') || s.includes('failed')) {
      return 'échoué';
    }
    if (s.includes('en attente') || s.includes('pending')) {
      return 'En attente';
    }

    return 'En attente';
  }

  loadAllCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (response: any) => {
        this.allCandidates = Array.isArray(response) ? response : (response.records || []);
      },
      error: (err) => console.error('❌ Error loading candidates:', err)
    });
  }

  getCandidateDisplay(ex: any): string {
    const c = ex.candidate;
    if (c && typeof c === 'object') {
      const first = c.firstName || c.first_name || '';
      const last = c.lastName || c.last_name || '';
      return `${first} ${last}`.trim() || `Candidat #${ex.candidateId || 'N/A'}`;
    }
    return `Candidat #${ex.candidateId || 'N/A'}`;
  }

  onCandidateFieldChange(): void {
    const name = this.selectedCandidateName.trim().toLowerCase();
    const email = this.selectedCandidateEmail.trim().toLowerCase();

    const found = this.allCandidates.find(c => {
      const fullName = `${c.firstName || c.first_name || ''} ${c.lastName || c.last_name || ''}`.trim().toLowerCase();
      const candidateEmail = (c.email || '').toLowerCase();
      return (email && candidateEmail === email) || (name && fullName.includes(name));
    });

    this.newExam.candidateId = found ? found.id : null;
  }

  get filteredExams(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.exams;
    return this.exams.filter(ex => 
      this.getCandidateDisplay(ex).toLowerCase().includes(term) ||
      (ex.examType || ex.exam_type || '').toLowerCase().includes(term)
    );
  }

  addExamen(): void {
    if (!this.newExam.candidateId || !this.newExam.examDate) {
      alert("Veuillez sélectionner un candidat et une date");
      return;
    }

    const payload = {
      candidateId: this.newExam.candidateId,
      examDate: this.newExam.examDate,
      examType: this.newExam.examType,
      status: this.newExam.status
    };

    this.examService.create(payload).subscribe({
      next: () => {
        this.loadExams();
        this.resetForm();
      },
      error: (err) => console.error('Create error:', err)
    });
  }

  editExamen(ex: any): void {
    this.isEditMode = true;
    this.newExam = {
      id: ex.id,
      candidateId: ex.candidateId || ex.candidate?.id,
      examDate: ex.examDate || ex.exam_date,
      examType: ex.examType || ex.exam_type,
      status: ex.status || 'En attente'
    };
  }

  updateExamen(): void {
    if (!this.newExam.id) return;

    const payload = {
      examDate: this.newExam.examDate,
      examType: this.newExam.examType,
      status: this.newExam.status
    };

    this.examService.update(this.newExam.id, payload).subscribe({
      next: () => {
        this.loadExams();
        this.resetForm();
      },
      error: (err) => console.error('Update error:', err)
    });
  }

  deleteExamen(): void {
    if (this.examToDelete?.id) {
      this.examService.delete(this.examToDelete.id).subscribe({
        next: () => { 
          this.loadExams(); 
          this.examToDelete = null; 
        },
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  selectToDelete(ex: any): void {
    this.examToDelete = ex;
  }

  resetForm(): void {
    this.newExam = {
      candidateId: null,
      examDate: '',
      examType: 'Code',
      status: 'En attente'
    };
    this.selectedCandidateName = '';
    this.selectedCandidateEmail = '';
    this.isEditMode = false;
  }
}