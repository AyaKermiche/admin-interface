import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'; // Ensure Router is imported
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, // Standard for modern Angular
  imports: [RouterOutlet, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'napoli-superadmin-app';
  showNavbar = false;
  private currentUser: any = null;

  constructor(private authService: AuthService, private router: Router) {
    // 1. Initialize user data
    this.authService.getCurrentUser().subscribe();

    // 2. Watch for Auth changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.checkVisibility();
    });

    // 3. Watch for URL changes (instantly hides navbar on /login)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkVisibility();
    });
  }

  private checkVisibility(): void {
    const isLoginPage = this.router.url === '/login';
    // Sidebar shows ONLY if we have a user AND we are not on the login page
    this.showNavbar = !!this.currentUser && !isLoginPage;
  }
}