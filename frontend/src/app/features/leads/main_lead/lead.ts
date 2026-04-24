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

//  Step 1: import pipe + validators
import { LeadBadgePipe } from './lead-badge.pipe';
import { onlyNumbers } from './lead.validators';

//  Step 2: import services
import { LeadFilterService } from './services/lead-filter.service';
import { LeadPaginationService } from './services/lead-pagination.service';
import { LeadModalComponent } from '../main_lead/modals/lead-model/lead-modal.component';
import { LeadNotesModalComponent } from '../main_lead/modals/note-model/lead-notes-modal.component';
import { LeadFilterModalComponent } from '../main_lead/modals/filter-model/lead-filter-modal.component';

interface LeadType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; name: string } | null;
  updatedBy: { _id: string; name: string } | null;
}
type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
type LeadStatus = 'Active' | 'Inactive' | 'Pending';
type NewLead = Omit<LeadType, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
type ActiveFilterType = 'stage' | 'status' | 'createdBy' | 'updatedBy' | 'createdDate' | 'updatedDate';

interface ActiveFilterChip {
  type: ActiveFilterType;
  label: string;
  value: string;
}

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
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    NgClass,
    FormsModule,
    SeletonLoder,
    RouterModule,
    NgxDaterangepickerMd,
    LeadBadgePipe,
    LeadModalComponent,
    LeadNotesModalComponent,
    LeadFilterModalComponent, //  Step 1: pipe
  ],
  templateUrl: './lead.html',
  styleUrl: './lead.css',
})
export class LeadComponent implements OnInit, OnDestroy {
  readonly stageOptions: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
  readonly statusOptions: LeadStatus[] = ['Active', 'Inactive', 'Pending'];
  userOptions: any[] = [];
  headers = ['ID', 'Name', 'Email', 'Phone', 'Stage', 'Status', 'Created', 'Action'];

  leads: LeadType[] = [];
  newLead: NewLead = defaultLead();

  isLoading = false;
  errorMessage = '';
  phoneError = '';
  emailError = '';

  showFilter = false;
  showModal = false;
  isEditMode = false;
  selectedLeadId: string | null = null;

  showNotesModal = false;
  selectedLeadForNote: any = null;
  noteText = '';
  isSaving = false;

  activeMenu: string | null = null;

  private leadSub!: Subscription;
  private createSub!: Subscription;
  private searchSubject = new Subject<string>();

  constructor(
    private leadService: LeadService,
    private noteService: NoteService,
    private userService: UserService,
    private router: Router,
    private cd: ChangeDetectorRef,
    //  Step 2: inject services
    public filterSvc: LeadFilterService,
    public pageSvc: LeadPaginationService,
  ) {}

  // ── Convenience getters — forward to services ────────────────────────────
  // These let the HTML keep working with minimal changes (e.g. filters.search)
  get filters() {
    return this.filterSvc.filters;
  }
  get currentPage() {
    return this.pageSvc.currentPage;
  }
  set currentPage(v) {
    this.pageSvc.currentPage = v;
  }
  get itemsPerPage() {
    return this.pageSvc.itemsPerPage;
  }
  set itemsPerPage(v) {
    this.pageSvc.itemsPerPage = v;
  }
  get totalPages() {
    return this.pageSvc.totalPages;
  }
  get totalLeads() {
    return this.leads.length;
  }

  get paginatedLeads(): LeadType[] {
    return this.pageSvc.paginate(this.leads);
  }

  get activeFilterChips(): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = [];

    this.filters.stage.forEach((stage: string) => {
      chips.push({ type: 'stage', label: 'Stage', value: stage });
    });

    this.filters.status.forEach((status: string) => {
      chips.push({ type: 'status', label: 'Status', value: status });
    });

    this.filters.createdBy.forEach((userId: string) => {
      chips.push({ type: 'createdBy', label: 'Created By', value: userId });
    });

    this.filters.updatedBy.forEach((userId: string) => {
      chips.push({ type: 'updatedBy', label: 'Updated By', value: userId });
    });

    if (this.filters.createdFrom || this.filters.createdTo) {
      chips.push({
        type: 'createdDate',
        label: 'Created At',
        value: `${this.filters.createdFrom || 'Start'} - ${this.filters.createdTo || 'End'}`,
      });
    }

    if (this.filters.updatedFrom || this.filters.updatedTo) {
      chips.push({
        type: 'updatedDate',
        label: 'Updated At',
        value: `${this.filters.updatedFrom || 'Start'} - ${this.filters.updatedTo || 'End'}`,
      });
    }

    return chips;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.userOptions = res.users;
      },
      error: (err) => {
        console.log('User API error:', err);
      },
    });

    this.searchSubject
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        switchMap((search) => {
          this.isLoading = true;
          this.errorMessage = '';
          this.filterSvc.filters.search = search;
          return this.leadService.getLeads(this.filterSvc.buildParams());
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

  // ── Load leads ───────────────────────────────────────────────────────────
  loadLeads(): void {
    this.pageSvc.reset();
    this.leadSub?.unsubscribe();
    this.isLoading = true;
    this.errorMessage = '';

    this.leadSub = this.leadService.getLeads(this.filterSvc.buildParams()).subscribe({
      next: (res: any) => {
        this.leads = res.data;
        this.pageSvc.setTotal(this.leads.length);
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

  // ── Search ───────────────────────────────────────────────────────────────
  onSearchClick(): void {
    this.pageSvc.reset();
    this.loadLeads();
  }
  onSearchChange(): void {
    this.errorMessage = '';
    this.searchSubject.next(this.filters.search);
  }

  // ── Filter delegates ─────────────────────────────────────────────────────
  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  resetFilters(): void {
    this.filterSvc.reset();
    this.cd.detectChanges();
    this.loadLeads();
  }

  getFilterChipText(chip: ActiveFilterChip): string {
    if (chip.type === 'createdBy' || chip.type === 'updatedBy') {
      const userName = this.userOptions.find(user => user._id === chip.value)?.name || chip.value;
      return `${chip.label}: ${userName}`;
    }

    return `${chip.label}: ${chip.value}`;
  }

  removeFilterChip(chip: ActiveFilterChip): void {
    if (chip.type === 'stage') {
      this.filters.stage = this.filters.stage.filter((stage: string) => stage !== chip.value);
    }

    if (chip.type === 'status') {
      this.filters.status = this.filters.status.filter((status: string) => status !== chip.value);
    }

    if (chip.type === 'createdBy') {
      this.filters.createdBy = this.filters.createdBy.filter((userId: string) => userId !== chip.value);
    }

    if (chip.type === 'updatedBy') {
      this.filters.updatedBy = this.filters.updatedBy.filter((userId: string) => userId !== chip.value);
    }

    if (chip.type === 'createdDate') {
      this.filters.createdFrom = '';
      this.filters.createdTo = '';
      this.filterSvc.createdRange = null;
    }

    if (chip.type === 'updatedDate') {
      this.filters.updatedFrom = '';
      this.filters.updatedTo = '';
      this.filterSvc.updatedRange = null;
    }

    this.loadLeads();
  }

  // ── Action menu ──────────────────────────────────────────────────────────
  toggleMenu(id: string): void {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  openModal(): void {
    this.newLead = defaultLead();
    this.errorMessage = '';
    this.isEditMode = false;
    this.selectedLeadId = null;
    this.showModal = true; // ← add this
  }
  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  // ── Edit lead ────────────────────────────────────────────────────────────
  editLead(lead: LeadType): void {
    this.isEditMode = true;
    this.selectedLeadId = lead._id;
    this.newLead = {
      _id: lead._id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      stage: lead.stage,
      status: lead.status,
    };
    this.showModal = true;
    this.activeMenu = null;
  }

  // ── Add / update lead (from modal component) ─────────────────────────────
  onModalSubmit(event: { lead: any; form: NgForm }): void {
    const { lead, form } = event;

    const request$ =
      this.isEditMode && this.selectedLeadId
        ? this.leadService.updateLead(this.selectedLeadId, {
            name: lead.name,
            stage: lead.stage,
            status: lead.status,
          })
        : this.leadService.createLead(lead);

    this.createSub = request$.subscribe({
      next: () => {
        this.closeModal();
        form.resetForm(defaultLead());
        this.isEditMode = false;
        this.selectedLeadId = null;
        this.loadLeads();
      },
      error: (err: any) => {
        const message = err?.error?.message || '';
        if (message.toLowerCase().includes('phone')) {
          // pass back to modal via input? For now, show in parent
        } else if (message.toLowerCase().includes('email')) {
          // same
        } else {
          this.errorMessage = message || 'Something went wrong. Try again.';
        }
      },
    });
  }

  // ── Notes (from modal component) ────────────────────────────────────────
  openNotesModal(lead: LeadType): void {
    this.selectedLeadForNote = lead;
    this.noteText = '';
    this.showNotesModal = true;
    this.activeMenu = null;
  }

  onNotesSubmit(noteText: string): void {
    if (!noteText.trim()) return;

    this.isSaving = true;
    this.noteService.addNote(this.selectedLeadForNote._id, noteText).subscribe({
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

  // ── Input helper ─────────────────────────────────────────────────────────
  //  Step 1: uses onlyNumbers from validators
  onlyNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyNumbers(input.value);
    this.newLead.phone = input.value;
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  goToLeadProfile(id: string): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/dashboard/leads', id]));
    window.open(url, '_blank');
  }

  // ── Badge (kept for template backward compat, pipe is preferred) ─────────
  getBadgeClass(value: string): string {
    const pipe = new LeadBadgePipe();
    return pipe.transform(value);
  }
}
