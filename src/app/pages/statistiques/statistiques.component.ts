import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { StatisticsService } from '../../services/stat.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.scss'
})
export class StatistiquesComponent implements OnInit {

  // Interface mise à jour pour correspondre au retour du backend[cite: 6, 8]
  stats: any = {
   
    candidates: 0,
    instructors: 0,
    sessionsToday: 0,
    totalRevenue: 0,
    successRate: 0,
    weeklySessions: [],
    monthlyRevenueData: [],
    weeklyLabels: [],
    monthlyLabels: []
  };
   adminName: string = '';

  chartMode: 'weekly' | 'monthly' = 'weekly';
  chart: any;
  loading = true;

  constructor(private statsService: StatisticsService ,
   private authService: AuthService
  ) {}

  ngOnInit() {
     this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.adminName = user.firstName; 
      }
    });
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data; // Récupère l'objet complet du backend[cite: 6, 8]
        this.loading = false;
        setTimeout(() => this.buildChart(), 100);
      },
      error: (err) => {
        console.error('Erreur de connexion à l\'API Dashboard:', err);
        this.loading = false;
      }
    });
  }

  setChartMode(mode: 'weekly' | 'monthly') {
    this.chartMode = mode;
    this.buildChart();
  }

  buildChart() {
    const canvas = document.getElementById('mainChart') as HTMLCanvasElement;
    if (!canvas || !this.stats) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // UTILISATION DES DONNÉES ET LABELS RÉELS DU BACKEND
    const labels = this.chartMode === 'weekly' 
      ? this.stats.weeklyLabels 
      : this.stats.monthlyLabels;

    const data = this.chartMode === 'weekly' 
      ? this.stats.weeklySessions 
      : this.stats.monthlyRevenueData;

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: this.chartMode === 'weekly' ? 'Sessions' : 'Revenus (DA)',
          data: data,
          backgroundColor: this.chartMode === 'weekly' ? '#0d6efd' : '#198754',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
          y: { 
            beginAtZero: true,
            ticks: {
              callback: (value) => this.chartMode === 'monthly' ? value + ' DA' : value
            }
          } 
        }
      }
    });
  }
}