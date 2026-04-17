import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  showDropdown = false;

  constructor(
    private router: Router,
    private authService: AuthService   // 🔥 inject service
  ) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  //  LOGOUT FUNCTION
logout() {
  // 🔥 Immediately remove token
  localStorage.removeItem('token');

  // 🔥 Redirect instantly
  this.router.navigateByUrl('/login');

  // Optional API call (background)
  this.authService.logout().subscribe({
    next: () => console.log("Logout API called"),
    error: () => console.log("Logout API failed")
  });
}

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}