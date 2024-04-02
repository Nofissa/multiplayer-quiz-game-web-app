import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanicModeButtonComponent } from './panic-mode-button.component';

describe('PanicModeButtonComponent', () => {
  let component: PanicModeButtonComponent;
  let fixture: ComponentFixture<PanicModeButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PanicModeButtonComponent]
    });
    fixture = TestBed.createComponent(PanicModeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
