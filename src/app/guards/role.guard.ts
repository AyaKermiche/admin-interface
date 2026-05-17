// src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      // Seul proprietaire peut accéder aux statistiques (pas secretaire)
      if (user && user.role?.toLowerCase() === 'proprietaire') {
        return true;
      }
      // Les secretaires et autres rôles sont bloqués
      router.navigate(['/home']);
      return false;
    })
  );
};