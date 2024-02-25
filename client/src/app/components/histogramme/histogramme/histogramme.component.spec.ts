import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogrammeComponent } from './histogramme.component';

describe('HistogrammeComponent', () => {
  let component: HistogrammeComponent;
  let fixture: ComponentFixture<HistogrammeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistogrammeComponent]
    });
    fixture = TestBed.createComponent(HistogrammeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
