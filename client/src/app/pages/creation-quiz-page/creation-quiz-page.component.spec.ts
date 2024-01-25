import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationQuizPageComponent } from './creation-quiz-page.component';

describe('CreationQuizPageComponent', () => {
  let component: CreationQuizPageComponent;
  let fixture: ComponentFixture<CreationQuizPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreationQuizPageComponent]
    });
    fixture = TestBed.createComponent(CreationQuizPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
