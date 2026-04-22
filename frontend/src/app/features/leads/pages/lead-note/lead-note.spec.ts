import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadNote } from './lead-note';

describe('LeadNote', () => {
  let component: LeadNote;
  let fixture: ComponentFixture<LeadNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadNote],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadNote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
