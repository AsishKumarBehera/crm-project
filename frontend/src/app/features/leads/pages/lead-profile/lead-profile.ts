import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { LeadService } from '../../../../core/services/lead.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lead-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-profile.html',
  styleUrl: './lead-profile.css',
})
export class LeadProfileComponent implements OnInit {

  @Input() leadId!: string;
  lead: any;

  constructor(
    private leadService: LeadService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit() {
    this.leadService.getLeadById(this.leadId).subscribe((res: any) => {
      this.lead = res.lead;
      this.cdr.detectChanges();  
    });
  }
}