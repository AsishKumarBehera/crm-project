import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NoteService } from '../../../../core/services/note.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-lead-notes',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './lead-note.html',
  styleUrl: './lead-note.css',
})
export class LeadNotesComponent implements OnChanges {

  @Input() leadId!: string;
  notes: any[] = [];

  constructor(
    private noteService: NoteService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['leadId'] && this.leadId) {
      this.noteService.getNotes(this.leadId).subscribe((res: any) => {
        this.notes = res.notes;
        this.cdr.detectChanges();  
      });
    }
  }

  editingNoteId: string | null = null;
editedText: string = '';
@Output() noteSaved = new EventEmitter<void>();
startEdit(note: any) {
  this.editingNoteId = note._id;
  this.editedText = note.text;
}

cancelEdit() {
  this.editingNoteId = null;
  this.editedText = '';
}

// updated note
updateNote(note: any) {
  const payload = {
    note: this.editedText
  };

  this.noteService.updateNote(note._id, payload)
    .subscribe((res: any) => {

      //  Update UI instantly
      note.text = res.note.text;
      note.updatedBy = res.note.updatedBy;
      note.updatedAt = res.note.updatedAt;

      this.cancelEdit();
      this.cdr.detectChanges();
    });
}



}