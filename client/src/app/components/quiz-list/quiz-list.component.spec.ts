// eslint-disable-next-line max-classes-per-file
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { of, throwError } from 'rxjs';
import { QuizListComponent } from './quiz-list.component';

describe('QuizListComponent', () => {
    let component: QuizListComponent;
    let fixture: ComponentFixture<QuizListComponent>;
    let mockQuizHttpService: jasmine.SpyObj<QuizHttpService>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let isQuizNameTakenSpy: jasmine.Spy;
    let tryParseSpy: jasmine.Spy;
    let handleImportSubscriptionSpy: jasmine.Spy;
    let filecheckerSpy: jasmine.Spy;

    const mockQuiz: Quiz = {
        _id: '1',
        id: '1',
        title: 'Mock Quiz',
        questions: [],
        isHidden: false,
        duration: 0,
        description: 'Mock Quiz Description',
        lastModification: new Date(),
    };

    const mockDialogRef = {
        afterClosed: () => of({ value: 'test' }),
    } as MatDialogRef<unknown, unknown>;

    const mockProgressEvent: ProgressEvent<FileReader> = {
        target: {
            result: '{"_id": "1","id": "1","title": "Quiz Title", "questions": [],"duration": "15","description": "Quiz Title"}',
        },
    } as ProgressEvent<FileReader>;

    const mockQuizzes: Quiz[] = [mockQuiz];

    beforeEach(() => {
        mockQuizHttpService = jasmine.createSpyObj('QuizHttpService', ['getAllQuizzes', 'createQuiz']);
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            declarations: [QuizListComponent],
            imports: [MatDialogModule, HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule],
            providers: [
                { provide: QuizHttpService, useValue: mockQuizHttpService },
                { provide: MatDialog, useValue: mockDialog },
            ],
        });
        fixture = TestBed.createComponent(QuizListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.quizzes = mockQuizzes;
        isQuizNameTakenSpy = spyOn(component, 'isQuizNameTaken').and.callThrough();
        tryParseSpy = spyOn(component, 'tryParse').and.callThrough();
        handleImportSubscriptionSpy = spyOn(component, 'handleImportSubscription').and.callThrough();
        filecheckerSpy = spyOn(component, 'filechecker').and.callThrough();
        fixture.detectChanges();
    });

    it('should return a Quiz object on successful parsing', () => {
        tryParseSpy.and.callThrough();
        const result = component['parseQuiz'](mockProgressEvent);

        expect(result).toEqual(
            jasmine.objectContaining({ _id: '1', id: '1', title: 'Quiz Title', questions: [], duration: '15', description: 'Quiz Title' }),
        );
    });

    it('should return null on unsuccessful parsing', () => {
        tryParseSpy.calls.reset();
        const result = component['parseQuiz']('{}' as unknown as ProgressEvent<FileReader>);

        expect(result).toBeNull();
    });

    it('should return true if quiz name is taken', () => {
        isQuizNameTakenSpy.and.returnValue(true);
        const quiz = { title: 'Mock Quiz' } as Quiz;
        component.quizzes = [quiz];

        const result = component['isQuizNameTaken'](mockQuiz);

        expect(result).toBeTrue();
    });

    it('should return false if quiz name is not taken', () => {
        const quiz = { title: 'New Quiz' } as Quiz;
        component.quizzes = [quiz];

        const result = component['isQuizNameTaken'](mockQuiz);

        expect(result).toBeFalse();
    });

    it('should handle import subscription if quiz succesful', fakeAsync(() => {
        mockQuizHttpService.createQuiz.and.returnValue(of(mockQuiz));
        component['handleImportSubscription'](mockQuiz);
        tick();
        expect(mockQuizHttpService.createQuiz).toHaveBeenCalledWith(mockQuiz);
        expect(component.quizzes).toContain(mockQuiz);
    }));

    it('should handle import subscription error', fakeAsync(() => {
        const mockError: HttpErrorResponse = new HttpErrorResponse({ error: { message: 'test' } });
        mockQuizHttpService.createQuiz.and.returnValue(throwError(() => mockError));
        component['handleImportSubscription'](mockQuiz);
        tick();
        expect(mockQuizHttpService.createQuiz).toHaveBeenCalledWith(mockQuiz);
        flush();
    }));

    it('should handle import subscription error with empty message', fakeAsync(() => {
        const mockError: HttpErrorResponse = new HttpErrorResponse({ error: { message: '' } });
        mockQuizHttpService.createQuiz.and.returnValue(throwError(() => mockError));
        component['handleImportSubscription'](mockQuiz);
        tick();
        expect(mockQuizHttpService.createQuiz).toHaveBeenCalledWith(mockQuiz);
        flush();
    }));

    it('should fetch quizzes', () => {
        mockQuizHttpService.getAllQuizzes.and.returnValue(of(mockQuizzes));
        component['fetchQuizzes']();
        expect(mockQuizHttpService.getAllQuizzes).toHaveBeenCalled();
    });

    it('should not import quiz if parsing fails', () => {
        tryParseSpy.and.returnValue(null);
        component['importQuiz'](mockProgressEvent);
        component.quizzes = [mockQuiz];
        expect(component.quizzes.length).toBe(1);
    });

    it('should open dialog on import click', () => {
        mockDialog.open.and.returnValue(mockDialogRef);
        isQuizNameTakenSpy.and.returnValue(false);
        handleImportSubscriptionSpy.and.stub();
        component['openPromptDialog'](mockQuiz);
        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should open dialog not work if quiz name is taken', () => {
        isQuizNameTakenSpy.and.returnValue(true);
        mockDialog.open.and.returnValue(mockDialogRef);
        component['openPromptDialog'](mockQuiz);
        expect(mockDialog.open).toHaveBeenCalled();
        expect(isQuizNameTakenSpy).toHaveBeenCalled();
    });

    it('should readfile parse if quiz is different', () => {
        mockQuizHttpService.createQuiz.and.returnValue(of(mockQuiz));
        component['readFile'](mockProgressEvent);
        expect(tryParseSpy).toHaveBeenCalled();
    });

    it('should readfile open dialog if quiz is same', () => {
        isQuizNameTakenSpy.and.returnValue(true);
        mockDialog.open.and.returnValue(mockDialogRef);
        handleImportSubscriptionSpy.and.stub();
        component['readFile'](mockProgressEvent);
        expect(tryParseSpy).toHaveBeenCalled();
        expect(isQuizNameTakenSpy).toHaveBeenCalled();
    });

    it('should return if file is null', () => {
        tryParseSpy.and.returnValue(null);
        component['readFile'](mockProgressEvent);
        expect(tryParseSpy).toHaveBeenCalled();
    });

    it('should file check', () => {
        const event = { target: { files: [{}] } } as unknown as Event;
        const result = component['filechecker'](event);
        expect(result).toBeTrue();
    });

    it('should import with no problems', () => {
        filecheckerSpy.and.returnValue(true);
        mockQuizHttpService.createQuiz.and.returnValue(of(mockQuiz));
        component['importQuiz'](mockProgressEvent);
        expect(filecheckerSpy).toHaveBeenCalled();
    });
});
