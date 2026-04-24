import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

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
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.pattern(/^(\S+@\S+\.\S+|[0-9]{10})$/) ] ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    console.log('🔐 Attempting login...');

    this.auth.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log('✅ Login successful:', res);
        // ✅ AuthService.login() now automatically stores token via tap()
        // No need to do anything here - just navigate!
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}