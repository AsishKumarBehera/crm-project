import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SeletonLoder } from '../../../seleton-loder/seleton-loder';

/*  Type for strong typing */
interface DashboardStats {
  total: number;
  new: number;
  converted: number;
  lost: number;
}

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SeletonLoder],
  templateUrl: './main-dashboard.html',
  styleUrls: ['./main-dashboard.css'],
})
export class MainDashboard implements OnInit, OnDestroy {
  userName = 'User';
  userInitials = 'AK';

  greeting = '';
  todayDate = new Date();

  selectedRange: string = '6m';
  chatInput: string = '';

  /* 🔥 Loading + Error */
  isLoading = true;
  errorMsg = '';

  /* 🔥 Strong typing */
  stats: DashboardStats = {
    total: 0,
    new: 0,
    converted: 0,
    lost: 0,
  };

  /* Subscription */
  private dashSub!: Subscription;
  recentActivity: any[] = [];
  


  /* Chat */
  chatMessages: any[] = [{ from: 'ai', text: 'Hello! How can I help you?' }];

  constructor(
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
  ) {}

  // ── INIT ──
  ngOnInit(): void {
    this.loadDashboard();
  }

  // ── LOAD DASHBOARD ──
  loadDashboard(): void {
    this.dashSub = this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        console.log("FULL RESPONSE 👉", res);
        this.userName = res?.user?.name || 'User';
        this.greeting = res?.message || '';
        this.recentActivity = res?.activity || [];

        this.stats = {
  total: res?.total || 0,
  new: res?.new || 0,
  converted: res?.converted || 0,
  lost: res?.lost || 0
};

        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Failed to load dashboard ❌';
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  /* Range */
  onRangeChange(): void {
    console.log('Range changed:', this.selectedRange);
  }


  /* Chat */
  sendMessage(): void {
    if (!this.chatInput.trim()) return;

    this.chatMessages.push({
      from: 'user',
      text: this.chatInput,
    });

    this.chatMessages.push({
      from: 'ai',
      text: 'Got it! Working on your request.',
    });

    this.chatInput = '';
  }

  // ── DESTROY ──
  ngOnDestroy(): void {
    if (this.dashSub) {
      this.dashSub.unsubscribe();
      console.log('Dashboard subscription cleaned');
    }
  }
}
