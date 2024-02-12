import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuizDetailsDialogComponent } from './quiz-details-dialog.component';
import { Router } from '@angular/router';

describe('QuizDetailsDialogComponent', () => {
    let component: QuizDetailsDialogComponent;
    let fixture: ComponentFixture<QuizDetailsDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<QuizDetailsDialogComponent>>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const quizId = 'mockId';
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            declarations: [QuizDetailsDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: { quizId } },
                { provide: Router, useValue: routerSpy },
            ],
        });
        fixture = TestBed.createComponent(QuizDetailsDialogComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<QuizDetailsDialogComponent>>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog on closeDialog', () => {
        component.closeDialog();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should close the dialog and navigate to the waiting room page on startGame', () => {
        component.startGame();
        expect(dialogRefSpy.close).toHaveBeenCalledWith();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/waiting-room'], { queryParams: { quizId: 'mockId' } });
    });
});
