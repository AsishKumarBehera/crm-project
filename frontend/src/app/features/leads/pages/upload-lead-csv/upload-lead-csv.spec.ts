import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadLeadCsv } from './upload-lead-csv';

describe('UploadLeadCsv', () => {
  let component: UploadLeadCsv;
  let fixture: ComponentFixture<UploadLeadCsv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadLeadCsv],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadLeadCsv);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
