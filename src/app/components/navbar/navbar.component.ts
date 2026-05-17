import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { DrivingSchoolService } from '../../services/driving-school.service';

declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // Utilisation exclusive des mêmes clés que votre formulaire HTML
  admin: any = { 
    id: null, 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '' 
  };
  
  school: any = { 
    id: null, 
    name: '', 
    address: '', 
    phone: '', 
    email: '', 
    description: '' 
  };

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = ''; 

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private schoolService: DrivingSchoolService
  ) {}

  ngOnInit(): void {
    this.loadCurrentAdmin();
  }

  private loadCurrentAdmin(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          // On s'assure de mapper correctement les propriétés vers le format CamelCase du HTML
          this.admin = {
            id: user.id,
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            email: user.email || '',
            phone: user.phone || ''
          };
          this.loadSchoolInfo();
        }
      }
    });
  }

  private loadSchoolInfo(): void {
  this.schoolService.getAll().subscribe({
    next: (response) => {
      console.log('School response:', response); // Check this in browser DevTools
      const schools = (response as any)?.records || (response as any)?.data || response;
      if (schools && schools.length > 0) {
        this.school = { ...schools[0] };
      }
    }
  });
}

  private openModal(targetId: string): void {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modalElem => {
      const instance = bootstrap.Modal.getInstance(modalElem);
      if (instance) instance.hide();
    });

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    setTimeout(() => {
      const nextModalElem = document.getElementById(targetId);
      if (nextModalElem) {
        const nextModal = new bootstrap.Modal(nextModalElem);
        nextModal.show();
      }
    }, 200);
  }

  openProfileModal(): void { this.openModal('profileModal'); }
  openEditProfileModal(): void { this.openModal('editProfileModal'); }
  openSchoolModal(): void { this.openModal('schoolModal'); }
  openEditSchoolModal(): void { this.openModal('editSchoolModal'); }
  
  openPasswordModal(): void {
    this.currentPassword = this.newPassword = this.confirmPassword = '';
    this.passwordError = '';
    this.openModal('passwordModal'); 
  }

  // ====================== PUT ACTIONS CORRIGÉS ======================

  updateAdmin(): void {
    if (!this.admin.id) {
      alert("ID de l'administrateur manquant");
      return;
    }

    const payload = {
      firstName: this.admin.firstName,
      lastName: this.admin.lastName,
      email: this.admin.email,
      phone: this.admin.phone
    };

    this.adminService.update(this.admin.id, payload).subscribe({
      next: () => { 
        alert('Profil mis à jour avec succès !'); 
        this.openProfileModal(); 
      },
      error: () => alert('Erreur lors de la mise à jour du profil')
    });
  }

updateSchool(): void {
    if (!this.school.id) {
      alert("Impossible de mettre à jour : ID de l'auto-école manquant");
      return;
    }

    // Sécurité : On isole et on fige uniquement les champs modifiables du formulaire.
    // Si vous n'avez pas touché au Nom ou à l'Adresse, ils gardent leurs anciennes valeurs.
    const schoolPayload = {
      name: this.school.name,
      address: this.school.address,
      phone: this.school.phone,
      email: this.school.email,
      description: this.school.description // Contient votre nouvelle description tapée
    };

    // CRITIQUE : On envoie le "schoolPayload" tout propre au lieu de "this.school"
    this.schoolService.update(this.school.id, schoolPayload).subscribe({
      next: (response) => {
        alert('Informations de l\'auto-école mises à jour avec succès !');
        
        // On met à jour l'objet local pour que le modal d'affichage s'actualise
        this.school = { ...this.school, ...schoolPayload };
        
        // On retourne sur le modal d'affichage
        this.openSchoolModal(); 
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la mise à jour de l\'école');
      }
    });
  }

  updatePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = "Les mots de passe ne correspondent pas.";
      return;
    }
    const payload = {
      current_password: this.currentPassword,
      password: this.newPassword,
      password_confirmation: this.confirmPassword
    };
    this.adminService.update(this.admin.id, payload).subscribe({
      next: () => {
        alert('Mot de passe changé avec succès !');
        this.currentPassword = this.newPassword = this.confirmPassword = '';
        this.openProfileModal();
      },
      error: (err) => this.passwordError = err.error?.message || 'Erreur changement mot de passe'
    });
  }

  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}