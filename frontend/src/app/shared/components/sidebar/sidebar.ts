import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isOpen = false;
  isLeadsOpen = false;
  constructor(private router: Router) {}

  openSidebar() {
    this.isOpen = true;
  }

  closeSidebar() {
    this.isOpen = false;
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.closeSidebar(); // optional
  }

  goToLeads() {
    this.router.navigate(['/dashboard/leads']);
    this.closeSidebar(); // optional
  }
  goToPublisher() {
    this.router.navigate(['/dashboard/publisher']);
    this.closeSidebar(); // optional
  }
  toggleLeadsMenu() {
    this.isLeadsOpen = !this.isLeadsOpen;
  }
  goToUploadCsv() {
    this.router.navigate(['/dashboard/leads/upload-csv']);
    this.closeSidebar();
  }
}
