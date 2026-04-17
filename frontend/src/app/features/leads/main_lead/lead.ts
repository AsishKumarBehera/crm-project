import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LeadService } from '../../../core/services/lead.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

/* ── Types ── */
interface LeadType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  status: LeadStatus;
  createdAt: Date;
}

type LeadStage  = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
type LeadStatus = 'Active' | 'Inactive' | 'Pending';
type NewLead = Omit<LeadType, 'createdAt'>;

const defaultLead = (): NewLead => ({
  _id: '',
  name: '',
  email: '',
  phone: '',
  stage: 'New',
  status: 'Active',
});

@Component({
  selector: 'app-lead',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgClass, SlicePipe, FormsModule, HttpClientModule],
  templateUrl: './lead.html',
  styleUrl: './lead.css',
})
export class LeadComponent implements OnInit, OnDestroy {

  showModal = false;
  showFilterModal = false;

  isLoading = false;
  errorMessage = '';

  leads: LeadType[] = [];
  newLead: NewLead = defaultLead();

  private leadSub!: Subscription;
  private createSub!: Subscription;

  /* 🔥 FILTERS */
  filters: any = {
    stage: '',
    status: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc'
  };

  constructor(private leadService: LeadService) {}

  // ── INIT ──
  ngOnInit(): void {
    this.loadLeads();
  }

  // ── LOAD LEADS ──
  loadLeads(): void {
    this.isLoading = true;

    const params: any = {};

    if (this.filters.stage) params.stage = this.filters.stage;
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.sortBy) params.sortBy = this.filters.sortBy;
    if (this.filters.order) params.order = this.filters.order;

    console.log("Sending Params:", params);

    this.leadSub = this.leadService.getLeads(params).subscribe({
      next: (res: any) => {
        this.leads = res?.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.leads = [];
        this.errorMessage = 'Failed to load leads.';
        this.isLoading = false;
      }
    });
  }

  // ── RESET FILTERS ──
  resetFilters(): void {
    this.filters = {
      stage: '',
      status: '',
      search: '',
      sortBy: 'createdAt',
      order: 'desc'
    };
    this.loadLeads();
  }

  // ── INPUT VALIDATION ──
  onlyNumbers(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, '');
    this.newLead.phone = event.target.value;
  }

  // ── MODAL HANDLING ──
  openModal(): void {
    this.newLead = defaultLead();
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  applyFilters(): void {
    this.errorMessage = '';
    this.closeFilterModal();
    this.loadLeads();
  }

  // ── ADD LEAD ──
  addLead(form: NgForm): void {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    this.newLead.name = this.newLead.name.trim();
    this.newLead.email = this.newLead.email.trim();
    this.newLead.phone = this.newLead.phone.trim();

    if (!/^[0-9]{10}$/.test(this.newLead.phone)) {
      this.errorMessage = 'Phone number must be exactly 10 digits.';
      return;
    }

    const duplicate = this.leads.find(
      l => l.email.toLowerCase() === this.newLead.email.toLowerCase()
    );

    if (duplicate) {
      this.errorMessage = `Lead with email "${this.newLead.email}" already exists.`;
      return;
    }

    this.errorMessage = '';

    this.createSub = this.leadService.createLead(this.newLead).subscribe({
      next: () => {
        this.closeModal();
        form.resetForm(defaultLead());
        this.loadLeads();
      },
      error: (err: any) => {
        this.errorMessage =
          err?.error?.message || 'Failed to create lead.';
      }
    });
  }

  // ── BADGE STYLE ──
  getBadgeClass(value: string): string {
    const map: Record<string, string> = {
      'New': 'lead__badge--new',
      'Contacted': 'lead__badge--contacted',
      'Qualified': 'lead__badge--qualified',
      'Proposal': 'lead__badge--proposal',
      'Closed': 'lead__badge--closed',
      'Active': 'lead__badge--active',
      'Inactive': 'lead__badge--inactive',
      'Pending': 'lead__badge--pending',
    };
    return map[value] ?? 'lead__badge--default';
  }

  readonly stageOptions: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
  readonly statusOptions: LeadStatus[] = ['Active', 'Inactive', 'Pending'];

  // ── DESTROY ──
  ngOnDestroy(): void {
    if (this.leadSub) {
      this.leadSub.unsubscribe();
    }

    if (this.createSub) {
      this.createSub.unsubscribe();
    }

    console.log("Subscriptions cleaned up");
  }
}