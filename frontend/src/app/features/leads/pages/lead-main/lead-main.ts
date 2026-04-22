import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadProfileComponent } from '../lead-profile/lead-profile';
import { LeadNotesComponent } from '../lead-note/lead-note';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-lead-main',
  standalone: true,
  imports: [LeadProfileComponent, LeadNotesComponent, CommonModule],
  templateUrl: './lead-main.html',
  styleUrl: './lead-main.css',
})
export class LeadMainComponent {

  activeTab: 'details' | 'notes' = 'details';
  leadId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.leadId = this.route.snapshot.params['id'];
  }
}