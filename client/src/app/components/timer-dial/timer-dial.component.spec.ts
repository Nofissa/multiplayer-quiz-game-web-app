import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerDialComponent } from './timer-dial.component';

describe('TimerDialComponent', () => {
  let component: TimerDialComponent;
  let fixture: ComponentFixture<TimerDialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimerDialComponent]
    });
    fixture = TestBed.createComponent(TimerDialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
