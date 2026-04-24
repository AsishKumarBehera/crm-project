import { Injectable, signal } from '@angular/core';
import dayjs from 'dayjs';

export interface LeadFilters {
  stage:       string[];
  status:      string[];
  createdBy:   string[];
  updatedBy:   string[];
  search:      string;
  sortBy:      string;
  order:       string;
  createdFrom: string;
  createdTo:   string;
  updatedFrom: string;
  updatedTo:   string;
}

const defaultFilters = (): LeadFilters => ({
  stage:       [],
  status:      [],
  createdBy:   [],
  updatedBy:   [],
  search:      '',
  sortBy:      'createdAt',
  order:       'desc',
  createdFrom: '',
  createdTo:   '',
  updatedFrom: '',
  updatedTo:   '',
});

@Injectable({ providedIn: 'root' })
export class LeadFilterService {
  /** Current filter state — read this in your component */
  filters: LeadFilters = defaultFilters();

  /** Date-range objects used by ngx-daterangepicker */
  createdRange: any = null;
  updatedRange:  any = null;

  /** Preset ranges for the date picker */
  readonly ranges: any = {
    Today:        [dayjs(), dayjs()],
    Yesterday:    [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
    'Last 7 Days':[dayjs().subtract(6, 'day'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };

  // ── Dropdown open state ──────────────────────────────────────────────────
  openDropdown: string | null = null;

  toggleDropdown(type: string): void {
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  // ── Checkbox helpers ─────────────────────────────────────────────────────
  onCheckboxChange(
    event: any,
    value: string,
    key: 'stage' | 'status' | 'createdBy' | 'updatedBy',
  ): void {
    if (event.target.checked) {
      this.filters[key] = Array.from(new Set([...this.filters[key], value]));
    } else {
      this.filters[key] = this.filters[key].filter(v => v !== value);
    }
  }

  // ── Display text for filter box ──────────────────────────────────────────
  getSelectedText(values: string[], type: string): string {
    if (!values || values.length === 0) {
      return type === 'user' ? 'All users' : `All ${type}`;
    }
    return values.length === 1 ? values[0] : `${values.length} selected`;
  }

  // ── Date range change handlers ───────────────────────────────────────────
  onCreatedRangeChange(event: any): void {
    if (event?.startDate && event?.endDate) {
      this.createdRange = { startDate: event.startDate, endDate: event.endDate };
    } else {
      this.createdRange = null;
    }
  }

  onUpdatedRangeChange(event: any): void {
    if (event?.startDate && event?.endDate) {
      this.updatedRange = { startDate: event.startDate, endDate: event.endDate };
    } else {
      this.updatedRange = null;
    }
  }

  // ── Apply: commit date ranges into filter strings ────────────────────────
  applyDateRanges(): void {
    if (this.createdRange?.startDate && this.createdRange?.endDate) {
      this.filters.createdFrom = dayjs(this.createdRange.startDate).format('YYYY-MM-DD');
      this.filters.createdTo   = dayjs(this.createdRange.endDate).format('YYYY-MM-DD');
    } else {
      this.filters.createdFrom = '';
      this.filters.createdTo   = '';
    }

    if (this.updatedRange?.startDate && this.updatedRange?.endDate) {
      this.filters.updatedFrom = dayjs(this.updatedRange.startDate).format('YYYY-MM-DD');
      this.filters.updatedTo   = dayjs(this.updatedRange.endDate).format('YYYY-MM-DD');
    } else {
      this.filters.updatedFrom = '';
      this.filters.updatedTo   = '';
    }
  }

  // ── Reset everything ─────────────────────────────────────────────────────
  reset(): void {
    this.filters      = defaultFilters();
    this.createdRange = null;
    this.updatedRange  = null;
    this.openDropdown = null;
  }

  // ── Build query params for the API call ──────────────────────────────────
  buildParams(): Record<string, string> {
    const p: Record<string, string> = {};
    const f = this.filters;

    if (f.stage.length)     p['stage']      = f.stage.join(',');
    if (f.status.length)    p['status']     = f.status.join(',');
    if (f.createdBy.length) p['createdBy']  = f.createdBy.join(',');
    if (f.updatedBy.length) p['updatedBy']  = f.updatedBy.join(',');
    if (f.search)           p['search']     = f.search;
    if (f.sortBy)           p['sortBy']     = f.sortBy;
    if (f.order)            p['order']      = f.order;
    if (f.createdFrom)      p['createdFrom']= f.createdFrom;
    if (f.createdTo)        p['createdTo']  = f.createdTo;
    if (f.updatedFrom)      p['updatedFrom']= f.updatedFrom;
    if (f.updatedTo)        p['updatedTo']  = f.updatedTo;

    return p;
  }
}