import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  signupForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dob: [''],
      profilePic: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    

    this.auth.signup(this.signupForm.value).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Signup Successful 🎉',
          text: 'Redirecting to login...',
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Something went wrong',
        });
      },
    });
  }
  onPhoneInput(event: any) {
  let value = event.target.value;

  // remove non-numbers
  value = value.replace(/[^0-9]/g, '');

  // limit to 10 digits
  value = value.slice(0, 10);

  this.signupForm.get('phone')?.setValue(value, { emitEvent: false });
}
}
