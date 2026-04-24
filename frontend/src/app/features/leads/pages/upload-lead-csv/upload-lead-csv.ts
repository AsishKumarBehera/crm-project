import { Component } from '@angular/core';
import { LeadService } from '../../../../core/services/lead.service';

@Component({
  selector: 'app-upload-lead-csv',
  standalone: true,
  templateUrl: './upload-lead-csv.html',
  styleUrl: './upload-lead-csv.css',
})
export class UploadLeadCsv {

  selectedFile!: File;

  constructor(private leadService: LeadService) {}

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.leadService.uploadCsv(formData).subscribe({
  next: (res: any) => {
    console.log('Upload success', res);
  },
  error: (err: any) => {
    console.error('Upload error', err);
  }
});
  }
}