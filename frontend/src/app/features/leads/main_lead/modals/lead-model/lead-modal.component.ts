import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { validateEmail, validatePhone, onlyNumbers } from '../../lead.validators';

type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
type LeadStatus = 'Active' | 'Inactive' | 'Pending';

interface NewLead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  status: LeadStatus;
}

@Component({
  selector: 'app-lead-modal',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './lead-modal.component.html',
  styleUrl: './lead-modal.component.css'
})
export class LeadModalComponent {
  @Input() isOpen = false;
  @Input() isEditMode = false;
  @Input() lead: NewLead = this.defaultLead();
  @Input() stageOptions: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
  @Input() statusOptions: LeadStatus[] = ['Active', 'Inactive', 'Pending'];

  @Output() closed = new EventEmitter<void>();
  @Output() submitted: EventEmitter<{ lead: NewLead; form: NgForm }> = new EventEmitter<{ lead: NewLead; form: NgForm }>();

  phoneError = '';
  emailError = '';

  private defaultLead(): NewLead {
    return { _id: '', name: '', email: '', phone: '', stage: 'New', status: 'Active' };
  }

  close(): void {
    this.closed.emit();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyNumbers(input.value);
    this.lead.phone = input.value;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    this.lead.name = this.lead.name.trim();
    this.lead.email = this.lead.email.trim();
    this.lead.phone = this.lead.phone.trim();

    const emailErr = validateEmail(this.lead.email);
    const phoneErr = validatePhone(this.lead.phone);

    if (emailErr) { this.emailError = emailErr; return; }
    if (phoneErr) { this.phoneError = phoneErr; return; }

    this.phoneError = '';
    this.emailError = '';

    this.submitted.emit({ lead: this.lead, form });
  }
}
