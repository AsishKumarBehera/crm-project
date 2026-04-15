import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService   // 🔥 connect backend
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // 🔥 API call
    this.auth.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        localStorage.setItem("token", res.token);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful 🎉',
          text: 'Redirecting to dashboard...',
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },

      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed ❌',
          text: err.error.message || 'Invalid credentials'
        });
      }
    });
  }
}