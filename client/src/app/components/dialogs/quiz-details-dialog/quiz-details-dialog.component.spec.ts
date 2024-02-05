import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizDetailsDialogComponent } from './quiz-details-dialog.component';

describe('QuizDetailsDialogComponent', () => {
    let component: QuizDetailsDialogComponent;
    let fixture: ComponentFixture<QuizDetailsDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizDetailsDialogComponent],
        });
        fixture = TestBed.createComponent(QuizDetailsDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
