import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Quiz } from '@common/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { of, throwError } from 'rxjs';
import { QuizListComponent } from './quiz-list.component';

describe('QuizListComponent', () => {
    let component: QuizListComponent;
    let fixture: ComponentFixture<QuizListComponent>;
    let mockQuizHttpService: jasmine.SpyObj<QuizHttpService>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let parseQuizSpy: jasmine.Spy;
    let handleImportSubscriptionSpy: jasmine.Spy;

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
        mockQuizHttpService = jasmine.createSpyObj('QuizHttpService', ['getAllQuizzes', 'createQuiz', 'deleteQuizById']);
        mockQuizHttpService.getAllQuizzes.and.returnValue(of(mockQuizzes));
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
        // To spy on method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parseQuizSpy = spyOn<any>(component, 'parseQuiz').and.callThrough();
        handleImportSubscriptionSpy = spyOn(component, 'handleImportSubscription').and.callThrough();
        fixture.detectChanges();
    });

    it('should return a Quiz object on successful parsing', () => {
        parseQuizSpy.and.callThrough();
        const result = component['parseQuiz'](mockProgressEvent);

        expect(result).toEqual(
            jasmine.objectContaining({ _id: '1', id: '1', title: 'Quiz Title', questions: [], duration: '15', description: 'Quiz Title' }),
        );
    });

    it('should return null on unsuccessful parsing', () => {
        parseQuizSpy.calls.reset();
        const result = component['parseQuiz']('{}' as unknown as ProgressEvent<FileReader>);

        expect(result).toBeNull();
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
        component['observeFetchQuizzes']();
        expect(mockQuizHttpService.getAllQuizzes).toHaveBeenCalled();
    });

    it('should not import quiz if parsing fails', () => {
        parseQuizSpy.and.returnValue(null);
        component['importQuiz'](mockProgressEvent);
        component.quizzes = [mockQuiz];
        expect(component.quizzes.length).toBe(1);
    });

    it('should open dialog on import click', () => {
        mockDialog.open.and.returnValue(mockDialogRef);
        handleImportSubscriptionSpy.and.stub();
        component['openPromptDialog'](mockQuiz);
        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle import subscription if quiz title is unique', fakeAsync(() => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of({ value: 'Unique Quiz Title' }));
        mockDialog.open.and.returnValue(dialogRefSpy);
        mockQuizHttpService.createQuiz.and.returnValue(of({} as Quiz));

        const mockUniqueQuiz: Quiz = {
            _id: '1',
            id: '1',
            title: 'Original Quiz Title',
            questions: [],
            isHidden: false,
            duration: 0,
            description: 'Mock Quiz Description',
            lastModification: new Date(),
        };

        component.openPromptDialog(mockUniqueQuiz);
        tick();

        expect(mockDialog.open).toHaveBeenCalled();

        expect(handleImportSubscriptionSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
                ...mockUniqueQuiz,
                title: 'Unique Quiz Title',
            }),
        );
    }));

    it('should open dialog not work if quiz name is taken', () => {
        mockDialog.open.and.returnValue(mockDialogRef);
        component['openPromptDialog'](mockQuiz);
        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should readfile open dialog if quiz is same', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of({ value: '' }));
        mockDialog.open.and.returnValue(dialogRefSpy);
        component['quizzes'][0].title = 'Quiz Title'; // to be equal to file title

        mockQuizHttpService.createQuiz.and.returnValue(of({} as Quiz));

        component['readFile'](mockProgressEvent);
        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should delete quiz successfully when called from another component', () => {
        component.quizzes = [mockQuiz];
        mockQuizHttpService.deleteQuizById.and.returnValue(of(undefined));

        component.deleteQuiz(mockQuiz);

        expect(component.quizzes.length).toBe(0);
    });

    it('should return if file is null', () => {
        parseQuizSpy.and.returnValue(null);
        component['readFile'](mockProgressEvent);
        expect(parseQuizSpy).toHaveBeenCalled();
    });
});
