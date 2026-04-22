import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadMain } from './lead-main';

describe('LeadMain', () => {
  let component: LeadMain;
  let fixture: ComponentFixture<LeadMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadMain],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
