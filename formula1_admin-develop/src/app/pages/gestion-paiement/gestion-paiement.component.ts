import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-gestion-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-paiement.component.html',
  styleUrl: './gestion-paiement.component.scss'
})
export class GestionPaiementComponent implements OnInit {

  payments: any[] = [];
  allCandidates: any[] = [];
  searchTerm: string = '';

  isEditMode = false;
  paymentToDelete: any = null;

  newPayment: any = {
    candidateId: null,
    amount: 0,
    payment_time: new Date().toISOString().slice(0, 16),
    candidateName: ''
  };

  searchCandidateText: string = '';
  showSuggestions = false;
  filteredCandidates: any[] = [];

  constructor(
    private paymentService: PaymentService,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadAllCandidates();
  }

 loadPayments(): void {
  this.paymentService.getAll().subscribe({
    next: (response: any) => {
      // The backend now provides 'resteALinstant'
      this.payments = response.map((p: any) => ({
        ...p,
        candidateName: this.getCandidateDisplay(p),
        // Use the backend's calculation
        reste: p.resteALinstant, 
        displayDate: p.paymentTime
      }));
    }
  });
}

  loadAllCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (response: any) => {
        this.allCandidates = Array.isArray(response) ? response : (response.records || []);
      },
      error: (err) => console.error('❌ Erreur chargement candidats', err)
    });
  }

  getCandidateDisplay(p: any): string {
    const c = p.candidate || {};
    const first = c.first_name || c.firstName || '';
    const last = c.last_name || c.lastName || '';
    return `${first} ${last}`.trim() || `Candidat #${p.candidateId || 'N/A'}`;
  }

  get filteredPayments(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.payments;
    return this.payments.filter(p => this.getCandidateDisplay(p).toLowerCase().includes(term));
  }

  // Recherche candidat
  onSearchCandidate(): void {
    const term = this.searchCandidateText.toLowerCase().trim();
    this.showSuggestions = term.length > 1;

    if (term.length > 1) {
      this.filteredCandidates = this.allCandidates.filter(c => {
        const fullName = `${c.first_name || c.firstName || ''} ${c.last_name || c.lastName || ''}`.toLowerCase();
        return fullName.includes(term);
      });
    } else {
      this.filteredCandidates = [];
    }
  }

  selectCandidate(candidate: any): void {
    this.newPayment.candidateId = candidate.id;
    this.newPayment.candidateName = `${candidate.first_name || candidate.firstName} ${candidate.last_name || candidate.lastName}`.trim();
    this.searchCandidateText = this.newPayment.candidateName;
    this.showSuggestions = false;
    this.filteredCandidates = [];
  }

savePaiement(): void {
  // 1. Basic Validation
  if (!this.newPayment.candidateId || this.newPayment.amount <= 0) {
    alert("Veuillez sélectionner un candidat et entrer un montant > 0");
    return;
  }

  // 2. Cumulative "Reste à Payer" Validation
  const selectedC = this.allCandidates.find(c => c.id === this.newPayment.candidateId);
  const totalToPay = selectedC ? Number(selectedC.totalPrice || selectedC.prix) : 0;

  // Calculate what was already paid (EXCEPT the current payment we are editing)
  const alreadyPaid = this.payments
    .filter(p => (p.candidateId === this.newPayment.candidateId) && p.id !== this.newPayment.id)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const remainingLimit = totalToPay - alreadyPaid;

  if (Number(this.newPayment.amount) > remainingLimit) {
    alert(`Impossible : Le reste à payer est de ${remainingLimit} DA. Vous ne pouvez pas saisir ${this.newPayment.amount} DA.`);
    return;
  }

  // 3. Prepare the Payload (Matching Backend names)
  const payload: any = {
    candidateId: this.newPayment.candidateId,
    amount: Number(this.newPayment.amount),
  };

  if (this.isEditMode) {
    // USE THE ORIGINAL DATE (prevents the date from changing to "today")
    // Note: We use the value from the form input
    payload.paymentTime = this.newPayment.payment_time; 
    
    this.paymentService.update(this.newPayment.id, payload).subscribe({
      next: () => { this.loadPayments(); this.resetForm(); },
      error: (err) => console.error('Update error:', err)
    });
  } else {
    // GENERATE NEW DATE only for brand new payments
    payload.paymentTime = new Date().toISOString();
    
    this.paymentService.create(payload).subscribe({
      next: () => { this.loadPayments(); this.resetForm(); },
      error: (err) => console.error('Create error:', err)
    });
  }
}

  editPaiement(p: any): void {
    this.isEditMode = true;
    this.newPayment = {
      id: p.id,
      candidateId: p.candidateId || p.candidate?.id,
      amount: Number(p.amount),
     
      candidateName: this.getCandidateDisplay(p)
    };
    this.searchCandidateText = this.newPayment.candidateName;
  }

  deletePaiement(): void {
    if (this.paymentToDelete?.id) {
      this.paymentService.delete(this.paymentToDelete.id).subscribe({
        next: () => { this.loadPayments(); this.paymentToDelete = null; },
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  selectToDelete(p: any): void {
    this.paymentToDelete = p;
  }

  resetForm(): void {
    this.newPayment = {
      candidateId: null,
      amount: 0,
      payment_time: new Date().toISOString().slice(0, 16),
      candidateName: ''
    };
    this.searchCandidateText = '';
    this.showSuggestions = false;
    this.filteredCandidates = [];
    this.isEditMode = false;
  }
}