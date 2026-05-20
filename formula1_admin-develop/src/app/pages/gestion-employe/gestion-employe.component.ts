import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AdminService } from '../../services/admin.service'; 
import { InstructorService } from '../../services/instructor.service';

@Component({
  selector: 'app-gestion-employe',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './gestion-employe.component.html',
  styleUrl: './gestion-employe.component.scss'
})
export class GestionEmployeComponent implements OnInit {

  employees: any[] = [];
  filteredEmployees: any[] = [];
  searchTerm: string = '';

  successMessage = '';
  errorMessage = '';
  isEditMode = false;
  selectedEmployee: any = null;

  form: any = this.getEmptyForm();

  constructor(
    private adminService: AdminService,
    private instructorService: InstructorService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  private getEmptyForm() {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      type: 'instructor'
    };
  }

  loadEmployees() {
    forkJoin({
      admins: this.adminService.getAll(),
      instructors: this.instructorService.getAll()
    }).subscribe({
      next: (res: any) => {
        const adminList = (res.admins?.records || res.admins || []).map((a: any) => ({
          ...a,
          type: 'admin',
          firstName: a.firstName || a.first_name || '',
          lastName: a.lastName || a.last_name || ''
        }));

        const instructorList = (res.instructors?.records || res.instructors || []).map((i: any) => ({
          ...i,
          type: 'instructor',
          firstName: i.firstName || i.first_name || '',
          lastName: i.lastName || i.last_name || ''
        }));

        this.employees = [...adminList, ...instructorList];
        this.filteredEmployees = [...this.employees];
      },
      error: (err) => this.showError('Erreur de chargement des données.')
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    this.filteredEmployees = this.employees.filter(e => 
      (e.firstName || e.first_name || '').toLowerCase().includes(term) || 
      (e.lastName || e.last_name || '').toLowerCase().includes(term)
    );
  }

  submitForm() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email) {
      this.showError('Veuillez remplir les champs obligatoires.');
      return;
    }

    const payload = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      phone: this.form.phone,
      email: this.form.email,
      drivingSchoolId: 1
    };

    if (this.isEditMode && this.selectedEmployee) {
      // UPDATE
      const service = this.selectedEmployee.type === 'admin' ? this.adminService : this.instructorService;
      service.update(this.selectedEmployee.id, payload).subscribe({
        next: () => this.handleSuccess('Modifié avec succès !'),
        error: () => this.showError('Erreur lors de la modification.')
      });
    } else {
      // CREATE
      const service = this.form.type === 'admin' ? this.adminService : this.instructorService;
      
      
  

      service.create(payload as any).subscribe({     // ← Ici on utilise .create() qui existe dans tes services
        next: () => this.handleSuccess('Ajouté avec succès !'),
        error: (err) => {
          console.error(err);
          this.showError('Erreur lors de l\'ajout.');
        }
      });
    }
  }

  deleteEmployee() {
    if (!this.selectedEmployee) return;

    const service = this.selectedEmployee.type === 'admin' 
      ? this.adminService 
      : this.instructorService;

    service.delete(this.selectedEmployee.id).subscribe({
      next: () => {
        this.handleSuccess('Supprimé avec succès.');
        this.closeModal('deleteEmployeModal');
      },
      error: () => this.showError('Erreur de suppression.')
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedEmployee = null;
    this.form = this.getEmptyForm();
  }

  openEditModal(emp: any) {
    this.isEditMode = true;
    this.selectedEmployee = emp;
    this.form = {
      firstName: emp.firstName || emp.first_name || '',
      lastName: emp.lastName || emp.last_name || '',
      phone: emp.phone || '',
      email: emp.email || '',
      type: emp.type || 'instructor'
    };
  }

  openDeleteModal(emp: any) {
    this.selectedEmployee = emp;
  }

  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
  }

  private handleSuccess(msg: string) {
    this.successMessage = msg;
    this.loadEmployees();
    this.closeModal('addEmployeModal');
    this.hideMessages();
  }

  closeModal(id: string) {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modalInstance = (window as any).bootstrap?.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    this.hideMessages();
  }

  private hideMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 4000);
  }
}