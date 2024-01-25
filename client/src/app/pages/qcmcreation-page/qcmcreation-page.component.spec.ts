import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QCMCreationPageComponent } from './qcmcreation-page.component';

describe('QCMCreationPageComponent', () => {
  let component: QCMCreationPageComponent;
  let fixture: ComponentFixture<QCMCreationPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QCMCreationPageComponent]
    });
    fixture = TestBed.createComponent(QCMCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
