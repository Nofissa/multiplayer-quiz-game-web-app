import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrlListComponent } from './qrl-list.component';

describe('QrlListComponent', () => {
  let component: QrlListComponent;
  let fixture: ComponentFixture<QrlListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QrlListComponent]
    });
    fixture = TestBed.createComponent(QrlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
