import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeletonLoder } from './seleton-loder';

describe('SeletonLoder', () => {
  let component: SeletonLoder;
  let fixture: ComponentFixture<SeletonLoder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeletonLoder],
    }).compileComponents();

    fixture = TestBed.createComponent(SeletonLoder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
