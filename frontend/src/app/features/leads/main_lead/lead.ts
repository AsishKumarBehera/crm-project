import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { LeadService } from '../../../core/services/lead.service';
import { NoteService } from '../../../core/services/note.service';
import { UserService } from '../../../core/services/user.service';
import { SeletonLoder } from '../../../seleton-loder/seleton-loder';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);
/* 
   Types
 */
interface LeadType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: {
  _id: string;
  name: string;
} | null;

  updatedBy: {
  _id: string;
  name: string;
} | null;
}

type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
type LeadStatus = 'Active' | 'Inactive' | 'Pending';
type NewLead = Omit<LeadType, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
const defaultLead = (): NewLead => ({
  _id: '',
  name: '',
  email: '',
  phone: '',
  stage: 'New',
  status: 'Active',
});

/* 
   Component
 */
@Component({
  selector: 'app-lead',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgClass, FormsModule, SeletonLoder, RouterModule, NgxDaterangepickerMd],
  templateUrl: './lead.html',
  styleUrl: './lead.css',
})
export class LeadComponent implements OnInit, OnDestroy {

  /* ── Dropdown Options ── */
  readonly stageOptions:  LeadStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
  readonly statusOptions: LeadStatus[] = ['Active', 'Inactive', 'Pending'];
  userOptions: any[] = []; // populated from cookie on init

  /* ── Table Headers ── */
  headers = ['ID', 'Name', 'Email', 'Phone', 'Stage', 'Status', 'Created', 'Action'];

  /* ── Leads Data ── */
  leads:   LeadType[] = [];
  newLead: NewLead = defaultLead();

  /* ── Loading / Error ── */
  isLoading = false;
  errorMessage = '';

  /* ── Field Errors ── */
  phoneError = '';
  emailError = '';

  /* ── Filters ── */
  filters = {
    stage:     '',
    status:    '',
    search:    '',
    sortBy:    'createdAt',
    order:     'desc',
    createdFrom: '',
createdTo: '',
updatedFrom: '',
updatedTo: '',
    createdBy: '',
    updatedBy: '',
  };


  // date range 
  isCustomRange = false;

  setDateRange(type: string) {
  const today = new Date();
  let from = new Date();
  let to = new Date();

  this.isCustomRange = false;

  switch (type) {

    case 'today':
      from = new Date();
      to = new Date();
      break;

    case 'yesterday':
      from = new Date();
      from.setDate(today.getDate() - 1);
      to = new Date(from);
      break;

    case 'last7':
      from = new Date();
      from.setDate(today.getDate() - 6);
      to = new Date();
      break;

    case 'month':
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date();
      break;

    case 'custom':
      this.isCustomRange = true;
      return;
  }

  this.filters.createdFrom = this.formatDate(from);
  this.filters.createdTo = this.formatDate(to);
}
formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

  /* ── Filter Panel ── */
  showFilter = false;

  /* ── Pagination ── */
  currentPage = 1;
  itemsPerPage = 10;

  /* ── Modal ── */
  showModal = false;
  isEditMode = false;
  selectedLeadId: string | null = null;

  /* ── Notes Modal ── */
  showNotesModal = false;
  selectedLeadForNote: any = null;
  noteText       = '';

  /* ── Action Menu ── */
  activeMenu: string | null = null;

  /* ── Subscriptions ── */
  private leadSub!:      Subscription;
  private createSub!:    Subscription;
  private searchSubject = new Subject<string>();

 createdRange: any = null;
updatedRange: any = null;
isValidRange(range: any): boolean {
  return range && range.startDate && range.endDate && 
         range.startDate.isValid() && range.endDate.isValid();
}

ranges: any = {
  'Today': [dayjs(), dayjs()],
  'Yesterday': [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
  'Last 7 Days': [dayjs().subtract(6, 'day'), dayjs()],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last Month': [
    dayjs().subtract(1, 'month').startOf('month'),
    dayjs().subtract(1, 'month').endOf('month')
  ]
};




  /* 
     Constructor
   */
  constructor(
    private leadService: LeadService,
    private noteService: NoteService,
    private userService: UserService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  /* 
     Lifecycle
   */
  ngOnInit(): void {

    setTimeout(() => {
    this.createdRange = null;
    this.updatedRange = null;
    this.cd.detectChanges();
  }, 0);
    // Read logged-in user name from cookie
    this.userService.getUsers().subscribe({
  next: (res: any) => {
    this.userOptions = res.users;
    console.log("Users loaded:", this.userOptions); // debug
  },
  error: (err) => {
    console.log("User API error:", err);
  }
});

    // Debounced search
    this.searchSubject
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        switchMap((searchValue) => {
          this.isLoading = true;
          this.errorMessage = '';
          this.filters.search = searchValue;
          return this.leadService.getLeads(this.buildParams());
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.leads = res.data;
          this.isLoading = false;
          this.cd.detectChanges();
        },
        error: (err: any) => {
          if (err.status === 0) return;
          this.errorMessage = 'Failed to load leads.';
          this.isLoading = false;
        },
      });

    this.loadLeads();
  }

  ngOnDestroy(): void {
    this.leadSub?.unsubscribe();
    this.createSub?.unsubscribe();
    this.searchSubject.complete();
  }

  /* 
     Helpers
   */

  // Build query params from filters (single source of truth)
  private buildParams(): Record<string, string> {
    const p: Record<string, string> = {};
    if (this.filters.stage)     p['stage'] = this.filters.stage;
    if (this.filters.status)    p['status'] = this.filters.status;
    if (this.filters.search)    p['search'] = this.filters.search;
    if (this.filters.sortBy)    p['sortBy'] = this.filters.sortBy;
    if (this.filters.order)     p['order'] = this.filters.order;
    if (this.filters.createdFrom) p['createdFrom'] = this.filters.createdFrom;
if (this.filters.createdTo) p['createdTo'] = this.filters.createdTo;
    if (this.filters.updatedFrom) p['updatedFrom'] = this.filters.updatedFrom;
if (this.filters.updatedTo) p['updatedTo'] = this.filters.updatedTo;
    if (this.filters.createdBy) p['createdBy'] = this.filters.createdBy;
    if (this.filters.updatedBy) p['updatedBy'] = this.filters.updatedBy;
    console.log('buildParams sending:', p);
    return p;
  }

  onFilterChange() {
  this.currentPage = 1;
  this.loadLeads();
}

  // Read a cookie by name
  getCookie(name: string): string {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  /* 
     Load Leads
   */
  loadLeads(): void {
    console.log("Selected createdBy:", this.filters.createdBy);
    this.currentPage = 1;
    this.leadSub?.unsubscribe();

    this.isLoading = true;
    this.errorMessage = '';

    this.leadSub = this.leadService.getLeads(this.buildParams()).subscribe({
      next: (res: any) => {
        this.leads = res.data;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 0 || err.statusText === 'Unknown Error') {
          this.isLoading = false;
          return;
        }
        if (err.status === 401) {
          setTimeout(() => this.loadLeads(), 300);
        } else {
          this.errorMessage = 'Failed to load leads.';
          this.isLoading = false;
        }
      },
    });
  }

  /* 
     Search
   */
  onSearchChange(): void {
    this.errorMessage = '';
    this.currentPage = 1;
    this.isLoading = false;
    this.searchSubject.next(this.filters.search);
  }

  onSearchClick(): void {
    this.currentPage = 1;
    this.loadLeads();
  }
  
  /* 
     Filters
   */
  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }
applyFilters() {
  // CREATED RANGE
  if (this.createdRange?.startDate && this.createdRange?.endDate) {
    const start = this.createdRange.startDate;
    const end = this.createdRange.endDate;

    // handle both moment and dayjs objects
    this.filters.createdFrom = typeof start.format === 'function'
      ? start.format('YYYY-MM-DD')
      : dayjs(start).format('YYYY-MM-DD');

    this.filters.createdTo = typeof end.format === 'function'
      ? end.format('YYYY-MM-DD')
      : dayjs(end).format('YYYY-MM-DD');
  } else {
    this.filters.createdFrom = '';
    this.filters.createdTo = '';
  }

  // UPDATED RANGE
  if (this.updatedRange?.startDate && this.updatedRange?.endDate) {
    const start = this.updatedRange.startDate;
    const end = this.updatedRange.endDate;

    this.filters.updatedFrom = typeof start.format === 'function'
      ? start.format('YYYY-MM-DD')
      : dayjs(start).format('YYYY-MM-DD');

    this.filters.updatedTo = typeof end.format === 'function'
      ? end.format('YYYY-MM-DD')
      : dayjs(end).format('YYYY-MM-DD');
  } else {
    this.filters.updatedFrom = '';
    this.filters.updatedTo = '';
  }

  console.log('Filters being sent:', this.filters); // verify dates are set
  this.showFilter = false; // close modal after apply
  this.loadLeads();
}
resetFilters(): void {
  this.filters = {
    stage:       '',
    status:      '',
    search:      '',
    sortBy:      'createdAt',
    order:       'desc',
    createdFrom: '',
    createdTo:   '',
    updatedFrom: '',
    updatedTo:   '',
    createdBy:   '',
    updatedBy:   '',
  };

  // ✅ Also clear the date range picker models
  this.createdRange = null;
  this.updatedRange = null;

  this.currentPage = 1;
  this.cd.detectChanges();
  this.loadLeads();
}

  /* 
     Pagination
   */
  get paginatedLeads(): LeadType[] {
    const perPage = +this.itemsPerPage;
    const start = (this.currentPage - 1) * perPage;
    return this.leads.slice(start, start + perPage);
  }

  get totalPages(): number {
    return Math.ceil(this.leads.length / +this.itemsPerPage);
  }

  get totalLeads(): number {
    return this.leads.length;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /* 
     Lead Profile
   */
  goToLeadProfile(id: string): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dashboard/leads', id])
    );
    window.open(url, '_blank');
  }

  /* 
     Action Menu
   */
  toggleMenu(id: string): void {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  /* 
     Modal
   */
  openModal(): void {
    this.newLead = defaultLead();
    this.errorMessage = '';
    this.isEditMode = false;
    this.selectedLeadId = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  closeAllModals(): void {
    this.showModal = false;
    this.showNotesModal = false;
  }

  /* 
     Edit Lead
   */
  editLead(lead: LeadType): void {
    this.closeAllModals();
    this.isEditMode = true;
    this.selectedLeadId = lead._id;
    this.newLead = {
      _id:    lead._id,
      name:   lead.name,
      email:  lead.email,
      phone:  lead.phone,
      stage:  lead.stage,
      status: lead.status,
    };
    this.showModal = true;
    this.activeMenu = null;
  }

  /* 
     Add / Update Lead
   */
  addLead(form: NgForm): void {
    if (form.invalid) {
      form.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.newLead.name = this.newLead.name.trim();
    this.newLead.email = this.newLead.email.trim();
    this.newLead.phone = this.newLead.phone.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newLead.email)) {
      this.errorMessage = 'Invalid email format';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.newLead.phone)) {
      this.errorMessage = 'Phone number must be exactly 10 digits.';
      return;
    }

    this.errorMessage = '';
    this.phoneError = '';
    this.emailError = '';

    const request$ = this.isEditMode && this.selectedLeadId
      ? this.leadService.updateLead(this.selectedLeadId, {
          name:   this.newLead.name,
          stage:  this.newLead.stage,
          status: this.newLead.status,
        })
      : this.leadService.createLead(this.newLead);

    this.createSub = request$.subscribe({
      next: () => {
        this.closeModal();
        form.resetForm(defaultLead());
        this.isEditMode = false;
        this.selectedLeadId = null;
        this.loadLeads();
      },
      error: (err: any) => {
        this.phoneError = '';
        this.emailError = '';
        this.errorMessage = '';

        const message = err?.error?.message || '';

        if (message.toLowerCase().includes('phone')) {
          this.phoneError = message;
        } else if (message.toLowerCase().includes('email')) {
          this.emailError = message;
        } else if (err.status === 400 || err.status === 409) {
          this.errorMessage = message;
        } else {
          this.errorMessage = 'Something went wrong. Try again.';
        }
      },
    });
  }

  /* 
     Notes
   */
  openNotesModal(lead: LeadType): void {
    this.closeAllModals();
    this.selectedLeadForNote = lead;
    this.noteText      = '';
    this.showNotesModal = true;
    this.activeMenu    = null;
  }

  isSaving = false;

saveNote(): void {
  if (!this.noteText.trim()) return;

  this.isSaving = true;

  this.noteService.addNote(this.selectedLeadForNote._id, this.noteText).subscribe({
    next: () => {
      this.showNotesModal = false;
      this.noteText = '';
      this.isSaving = false;
      this.cd.detectChanges();
    },
    error: () => {
      this.isSaving = false;
      alert('Error saving note');
    },
  });
}

  /* 
     Input Validation
   */
  onlyNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.newLead.phone = input.value;
  }

  /* 
     Badge
   */
  getBadgeClass(value: string): string {
    const map: Record<string, string> = {
      New:       'lead__badge--new',
      Contacted: 'lead__badge--contacted',
      Qualified: 'lead__badge--qualified',
      Proposal:  'lead__badge--proposal',
      Closed:    'lead__badge--closed',
      Active:    'lead__badge--active',
      Inactive:  'lead__badge--inactive',
      Pending:   'lead__badge--pending',
    };
    return map[value] ?? 'lead__badge--default';
  }

onCreatedRangeChange(event: any): void {
  if (event && event.startDate && event.endDate) {
    this.createdRange = event;
  } else {
    this.createdRange = null;
  }
}

// handler

onUpdatedRangeChange(event: any): void {
  if (event && event.startDate && event.endDate) {
    this.updatedRange = event;
  } else {
    this.updatedRange = null;
  }
}


  
}