import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { of, throwError } from 'rxjs';
import { QuizDetailsDialogComponent } from './quiz-details-dialog.component';

describe('QuizDetailsDialogComponent', () => {
    let component: QuizDetailsDialogComponent;
    let fixture: ComponentFixture<QuizDetailsDialogComponent>;
    let quizHttpServiceMock: jasmine.SpyObj<QuizHttpService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<QuizDetailsDialogComponent>>;
    const mockQuiz = quizStub();
    const mockData = {
        quiz: mockQuiz,
        onStartGame: jasmine.createSpy('onStartGame'),
        onTestGame: jasmine.createSpy('onTestGame'),
        onNotFound: jasmine.createSpy('onNotFound'),
        onCreateGame: jasmine.createSpy('onCreateGame'),
    };

    beforeEach(() => {
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        quizHttpServiceMock = jasmine.createSpyObj('QuizHttpService', ['getVisibleQuizById']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [QuizDetailsDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: mockData },
                { provide: QuizHttpService, useValue: quizHttpServiceMock },
            ],
        }).compileComponents();

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

    it('should call onNotFound when startGame quiz is not found', () => {
        const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
        quizHttpServiceMock.getVisibleQuizById.and.returnValue(throwError(() => errorResponse));
        component.startGame();
        expect(quizHttpServiceMock.getVisibleQuizById).toHaveBeenCalledWith('testId');
        expect(mockData.onNotFound).toHaveBeenCalled();
    });

    it('should call ontestGame with the quiz when testGame is successful', () => {
        quizHttpServiceMock.getVisibleQuizById.and.returnValue(of(mockQuiz));
        component.testGame();
        expect(quizHttpServiceMock.getVisibleQuizById).toHaveBeenCalledWith('testId');
        expect(mockData.onTestGame).toHaveBeenCalledWith(mockQuiz);
    });

    it('should call onCreateGame with the quiz', () => {
        quizHttpServiceMock.getVisibleQuizById.and.returnValue(of(mockQuiz));
        component.startGame();
        expect(quizHttpServiceMock.getVisibleQuizById).toHaveBeenCalledWith('testId');
        expect(mockData.onCreateGame).toHaveBeenCalledWith(mockQuiz);
    });

    it('should call onNotFound when testGame quiz is not found', () => {
        const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
        quizHttpServiceMock.getVisibleQuizById.and.returnValue(throwError(() => errorResponse));
        component.testGame();
        expect(quizHttpServiceMock.getVisibleQuizById).toHaveBeenCalledWith('testId');
        expect(mockData.onNotFound).toHaveBeenCalled();
    });
});
