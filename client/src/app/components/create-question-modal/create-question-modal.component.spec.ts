import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestionModalComponent } from './create-question-modal.component';

describe('CreateQuestionModalComponent', () => {
  let component: CreateQuestionModalComponent;
  let fixture: ComponentFixture<CreateQuestionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateQuestionModalComponent]
    });
    fixture = TestBed.createComponent(CreateQuestionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
