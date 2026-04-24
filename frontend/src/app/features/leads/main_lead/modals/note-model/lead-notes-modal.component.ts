import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';



@Component({
  selector: 'app-lead-notes-modal',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './lead-notes-modal.component.html',
  styleUrl: './lead-notes-modal.component.css'
})
export class LeadNotesModalComponent {
  @Input() isOpen = false;
  @Input() noteText = '';
  @Input() isSaving = false;

  @Output() closed = new EventEmitter<void>();
@Output() submitted: EventEmitter<string> = new EventEmitter<string>();

  close(): void {
    this.closed.emit();
  }

  save(): void {
    if (!this.noteText.trim()) return;
    this.submitted.emit(this.noteText);
  }
}