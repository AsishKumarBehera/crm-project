import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  // 👤 user data (temporary)
  user = {
    name: '',
    email: ''
  };

  constructor(private router: Router) {}

  // 🔥 Load user data (from localStorage for now)
  ngOnInit() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  // 🔥 Update profile
  updateProfile() {
    localStorage.setItem('user', JSON.stringify(this.user));

    alert('Profile updated successfully ✅');
  }

  // 🔥 Go back
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}