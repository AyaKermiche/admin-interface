import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { GestionCandidatComponent } from './pages/gestion-candidat/gestion-candidat.component';
import { GestionExamenComponent } from './pages/gestion-examen/gestion-examen.component';
import { GestionEmployeComponent } from './pages/gestion-employe/gestion-employe.component';
import { PlanningComponent } from './pages/planning/planning.component';
import { StatistiquesComponent } from './pages/statistiques/statistiques.component';
import { HomeComponent } from './pages/home/home.component';
import { GestionPaiementComponent } from './pages/gestion-paiement/gestion-paiement.component';
import { PlanningMoniteurComponent } from './pages/planning-moniteur/planning-moniteur.component';
//import { SubscriptionStoreComponent } from './pages/subscription-store/subscription-store.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },

  {
    path: 'candidats',
    component:  GestionCandidatComponent,
    canActivate: [authGuard],
  },
  {
    path: 'examen',
    component: GestionExamenComponent,
    canActivate: [authGuard],
  },
  {
    path: 'employes',
    component: GestionEmployeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'planning',
    component: PlanningComponent,
    canActivate: [authGuard],
  },
  {
    path: 'statistiques',
    component: StatistiquesComponent,
    canActivate: [authGuard, roleGuard],
  },
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [authGuard],
    },
  {
    path: 'paiement',
    component: GestionPaiementComponent,
    canActivate: [authGuard],
  },
 
  { path: 'planning-moniteur/:id', component: PlanningMoniteurComponent },
];

