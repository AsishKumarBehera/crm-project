import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { HostListener, ElementRef } from '@angular/core';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {

  showDropdown = false;
  showProfile = false;
  previewUrl: string | null = null;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  isSaving = false;
languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada'];
  profile = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    profilePic: '',
  address: '',
  language: 'English'
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
    private eRef: ElementRef,
    private cd: ChangeDetectorRef,

  ) {}

  @HostListener('document:click', ['$event'])
clickOutside(event: Event) {
  if (!this.eRef.nativeElement.contains(event.target)) {
    this.showDropdown = false;
  }
}

  ngOnInit() {
    this.loadProfile();
  }

  // ── Load profile from backend
  loadProfile() {
    this.isLoading = true;
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        this.profile = {
          name: res.name || '',
          email: res.email || '',
          phone: res.phone || '',
          dob: res.dob ? res.dob.substring(0, 10) : '',  // format date
          profilePic: res.profilePic || '',
          address: res.address || '',
          language: res.language || 'English' 
        };
        this.previewUrl = res.profilePic || null;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  // ── Toggle dropdown
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.errorMessage = '';
    
  }

  // ── Open profile panel
  openProfile(event: Event) {
    event.stopPropagation();
    this.showDropdown = false;
    this.showProfile = true;
  }

  // ── Close profile panel
  closeProfile() {
    this.showProfile = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ── Image change
  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.profile.profilePic = reader.result as string; // base64
      };
      reader.readAsDataURL(file);
    }
  }

  // ── Save profile
  onSave() {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.userService.updateProfile(this.profile).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
        this.showToast('Profile updated successfully 🎉', 'success');
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Update failed. Try again.';
        this.isSaving = false;
      }
    });
  }

  toastMessage: string = '';
toastType: string = 'success'; // success | error
showToast(message: string, type: string = 'success') {
  this.toastMessage = message;
  this.toastType = type;

  setTimeout(() => {
    this.toastMessage = '';
  }, 3000);
}

 logout() {
  this.showDropdown = false;

  // call backend to clear the cookie
  this.auth.logout().subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },
    error: () => {
      // even if error, still navigate to login
      this.router.navigate(['/login']);
    }
  });
}
}