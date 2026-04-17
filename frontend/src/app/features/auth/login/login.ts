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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService   // 🔥 connect backend
  ) {
    this.loginForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.pattern(/^(\S+@\S+\.\S+|[0-9]{10})$/) ] ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
  this.submitted = true;

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.auth.login(this.loginForm.value).subscribe({
    next: (res: any) => {

      //  save token
      // localStorage.setItem("token", res.token);

      //  ONLY navigate
      this.router.navigate(['/dashboard']);
     },
    error: (err) => {
      console.error(err);
    }
  });
}
}