import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { LeadFilterService } from '../../services/lead-filter.service';

type FilterDropdownKey = 'stage' | 'status' | 'createdBy' | 'updatedBy';
interface SelectedFilterItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-lead-filter-modal',
  standalone: true,
  imports: [FormsModule, NgxDaterangepickerMd],
  templateUrl: './lead-filter-modal.component.html',
  styleUrls: ['./lead-filter-modal.component.css'],
})
export class LeadFilterModalComponent {
  @Input() isOpen = false;
  @Input() stageOptions: string[] = [];
  @Input() statusOptions: string[] = [];
  @Input() userOptions: any[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();
  @Output() resetted = new EventEmitter<void>();

  dropdownSearch: Record<FilterDropdownKey, string> = {
    stage: '',
    status: '',
    createdBy: '',
    updatedBy: '',
  };

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // close dropdown only (NOT modal)
    if (!target.closest('.filter-group')) {
      this.filterSvc.openDropdown = null;
    }
  }

  onOverlayClick(event: Event) {
    // first close dropdown
    this.filterSvc.openDropdown = null;

    // then close modal
    this.close();
  }
  constructor(public filterSvc: LeadFilterService) {}

  get filters() {
    return this.filterSvc.filters;
  }
  get createdRange() {
    return this.filterSvc.createdRange;
  }

  set createdRange(value: any) {
    this.filterSvc.createdRange = value;
  }
  get updatedRange() {
    return this.filterSvc.updatedRange;
  }

  set updatedRange(value: any) {
    this.filterSvc.updatedRange = value;
  }
  get ranges() {
    return this.filterSvc.ranges;
  }
  get openDropdown() {
    return this.filterSvc.openDropdown;
  }

  toggleDropdown(type: string): void {
    this.filterSvc.toggleDropdown(type);
  }
  onCheckboxChange(e: any, v: string, k: any): void {
    this.filterSvc.onCheckboxChange(e, v, k);
  }
  getSelectedText(v: string[], t: string): string {
    return this.filterSvc.getSelectedText(v, t);
  }
  getUserSelectedText(values: string[]): string {
    if (!values || values.length === 0) return 'All users';

    const selectedNames = values
      .map((id) => this.userOptions.find((user) => user._id === id)?.name)
      .filter(Boolean);

    if (selectedNames.length === 0) return 'All users';
    return selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} selected`;
  }

  getSelectedItems(key: FilterDropdownKey): SelectedFilterItem[] {
    return this.filters[key].map((value) => ({
      value,
      label:
        key === 'createdBy' || key === 'updatedBy'
          ? this.userOptions.find((user) => user._id === value)?.name || value
          : value,
    }));
  }

  removeSelectedValue(event: Event, key: FilterDropdownKey, value: string): void {
    event.stopPropagation();
    this.filters[key] = this.filters[key].filter((item) => item !== value);
  }

  clearSelectedValues(event: Event, key: FilterDropdownKey): void {
    event.stopPropagation();
    this.filters[key] = [];
  }

  getFilteredOptions(options: string[], key: FilterDropdownKey): string[] {
    const search = this.dropdownSearch[key].trim().toLowerCase();
    if (!search) return options;
    return options.filter((option) => option.toLowerCase().includes(search));
  }

  getFilteredUsers(key: FilterDropdownKey): any[] {
    const search = this.dropdownSearch[key].trim().toLowerCase();
    if (!search) return this.userOptions;
    return this.userOptions.filter((user) =>
      String(user.name || '')
        .toLowerCase()
        .includes(search),
    );
  }

  getFilteredUserIds(key: FilterDropdownKey): string[] {
    return this.getFilteredUsers(key).map((user) => user._id);
  }

  isAllSelected(selectedValues: string[], values: string[]): boolean {
    return values.length > 0 && values.every((value) => selectedValues.includes(value));
  }

  isPartiallySelected(selectedValues: string[], values: string[]): boolean {
    return (
      values.some((value) => selectedValues.includes(value)) &&
      !this.isAllSelected(selectedValues, values)
    );
  }

  toggleSelectAll(event: Event, key: FilterDropdownKey, values: string[]): void {
    const checked = (event.target as HTMLInputElement).checked;
    const currentValues = this.filters[key];

    if (checked) {
      this.filters[key] = Array.from(new Set([...currentValues, ...values]));
      return;
    }

    this.filters[key] = currentValues.filter((value) => !values.includes(value));
  }

  onCreatedRangeChange(e: any): void {
    this.filterSvc.onCreatedRangeChange(e);
  }
  onUpdatedRangeChange(e: any): void {
    this.filterSvc.onUpdatedRangeChange(e);
  }

  close(): void {
    this.filterSvc.openDropdown = null;
    this.clearDropdownSearch();
    this.closed.emit();
  }

  apply(): void {
    this.filterSvc.openDropdown = null;
    this.clearDropdownSearch();
    this.filterSvc.applyDateRanges();
    this.applied.emit();
  }

  reset(): void {
    this.filterSvc.openDropdown = null;
    this.clearDropdownSearch();

    setTimeout(() => {
      this.resetted.emit();
    });
  }

  private clearDropdownSearch(): void {
    this.dropdownSearch = {
      stage: '',
      status: '',
      createdBy: '',
      updatedBy: '',
    };
  }
}
