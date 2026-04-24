import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LeadPaginationService {
  currentPage  = 1;
  itemsPerPage = 10;

  /** Call this whenever filters change so we go back to page 1 */
  reset(): void {
    this.currentPage = 1;
  }

  /** Slice the full list down to the current page */
  paginate<T>(items: T[]): T[] {
    const perPage = +this.itemsPerPage;
    const start   = (this.currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }

  get totalPages(): number {
    // Set via setTotal() before reading this
    return this._totalPages;
  }

  private _totalPages = 1;

  /** Call after every load so totalPages stays accurate */
  setTotal(itemCount: number): void {
    this._totalPages = Math.ceil(itemCount / +this.itemsPerPage);
    // Clamp currentPage in case items shrank
    if (this.currentPage > this._totalPages) {
      this.currentPage = Math.max(1, this._totalPages);
    }
  }

  get pages(): number[] {
    return Array.from({ length: this._totalPages }, (_, i) => i + 1);
  }

  goTo(page: number): void {
    if (page >= 1 && page <= this._totalPages) {
      this.currentPage = page;
    }
  }

  prev(): void { this.goTo(this.currentPage - 1); }
  next(): void { this.goTo(this.currentPage + 1); }

  get isFirst(): boolean { return this.currentPage === 1; }
  get isLast():  boolean { return this.currentPage === this._totalPages; }
}