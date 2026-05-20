// FILE: login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username: string = '';   // You can keep this name in HTML
  password: string = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

onSubmit(): void {
  this.loading = true;
  this.error = '';

  this.authService.login(this.username, this.password).subscribe({
    next: () => {
      // After successful login, fetch user profile
      this.authService.getCurrentUser().subscribe(() => {
        this.router.navigate(['/home']);
      });
    },
    error: (err) => {
      this.error = err.error?.message || 'Invalid email or password';
      this.loading = false;
    }
  });
}
}