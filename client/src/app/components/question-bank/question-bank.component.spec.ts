import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionBankComponent } from './question-bank.component';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionServicesProvider } from '@app/providers/question-services.provider';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { Question } from '@app/interfaces/question';
import { Subject, of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { QuestionHttpService } from '@app/services/question-http/question-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { questionStub } from '@app/TestStubs/question.stubs';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;

    let materialServicesProviderSpy: SpyObj<MaterialServicesProvider>;
    let dialogServiceSpy: SpyObj<MatDialog>;
    let dialogRefSpy: SpyObj<MatDialogRef<Question>>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    let questionServicesProvider: SpyObj<QuestionServicesProvider>;
    let questionHttpServiceSpy: SpyObj<QuestionHttpService>;
    let questionSharingServiceSpy: SpyObj<QuestionSharingService>;

    let mockQuestions: Question[];

    let mockQuestionSubject: Subject<Question>;
    let mockQuestionEditedSubject: Subject<Question>;
    let booleanSubject: Subject<boolean>;

    beforeEach(async () => {
        mockQuestions = questionStub();

        mockQuestionSubject = new Subject();
        mockQuestionEditedSubject = new Subject();
        booleanSubject = new Subject();

        questionHttpServiceSpy = jasmine.createSpyObj('QuestionHttpService', [
            'getAllQuestions',
            'updateQuestion',
            'deleteQuestionById',
            'createQuestion',
        ]);
        questionHttpServiceSpy.getAllQuestions.and.returnValue(of([mockQuestions[0]]));
        questionHttpServiceSpy.createQuestion.and.returnValue(mockQuestionSubject);
        questionHttpServiceSpy.updateQuestion.and.returnValue(mockQuestionEditedSubject);
        questionHttpServiceSpy.deleteQuestionById.and.returnValue(of(undefined));

        questionSharingServiceSpy = jasmine.createSpyObj(QuestionSharingService, ['share', 'subscribe']);
        questionSharingServiceSpy['callbacks'] = [];
        questionSharingServiceSpy.subscribe.and.callFake((callback: (data: Question) => void) => {
            questionSharingServiceSpy['callbacks'].push(callback);
        });
        questionSharingServiceSpy.share.and.callFake((question: Question) => {
            questionSharingServiceSpy['callbacks'].forEach((callback: (data: Question) => void) => {
                callback(question);
            });
        });

        questionServicesProvider = new QuestionServicesProvider(questionHttpServiceSpy, questionSharingServiceSpy);

        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogServiceSpy.open.and.returnValue(dialogRefSpy);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        materialServicesProviderSpy = new MaterialServicesProvider(dialogServiceSpy, snackBarSpy) as SpyObj<MaterialServicesProvider>;

        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
            providers: [
                { provide: MaterialServicesProvider, useValue: materialServicesProviderSpy },
                { provide: QuestionServicesProvider, useValue: questionServicesProvider },
                QuestionInteractionService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.questions = [];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(questionHttpServiceSpy.getAllQuestions).toHaveBeenCalled();
        expect(questionSharingServiceSpy.subscribe).toHaveBeenCalled();
        questionSharingServiceSpy.share(mockQuestions[0]);
    });

    describe('Tests where component.questions is empty in the begining', () => {
        beforeEach(() => {
            component.questions = [];
            questionHttpServiceSpy.createQuestion.calls.reset();
            questionHttpServiceSpy.updateQuestion.calls.reset();
            questionHttpServiceSpy.deleteQuestionById.calls.reset();
            questionHttpServiceSpy.getAllQuestions.calls.reset();
            dialogServiceSpy.open.calls.reset();
            dialogRefSpy.afterClosed.and.stub();
        });

        it('should invokeOnShare use shareQuestion logic and call addQuestion', () => {
            // to spy on private method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const addQuestionSpy = spyOn<any>(component, 'addQuestion').and.callThrough();

            component.questionInteractionService.invokeOnShareQuestion(mockQuestions[0]);

            expect(questionSharingServiceSpy.share).toHaveBeenCalled();
            expect(addQuestionSpy).toHaveBeenCalled();
        });
        it('should add a question to questions[] when a question is submitted', () => {
            dialogRefSpy.afterClosed.and.callFake(() => of({ ...mockQuestions[0] }));
            component.openAddQuestionDialog();
            mockQuestionSubject.next({ ...mockQuestions[0] });
            expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
            expect(component.questions).toEqual([{ ...mockQuestions[0] }]);
        });

        it('should not add a question to questions[] when an error is thrown', () => {
            dialogRefSpy.afterClosed.and.callFake(() => of({ ...mockQuestions[0] }));
            questionHttpServiceSpy.createQuestion.and.returnValue(throwError(() => new Error('test')));
            component.openAddQuestionDialog();
            mockQuestionSubject.error(undefined);
            expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
            expect(component.questions).toEqual([]);
        });

        it('should not edit an existing question when question is submitted and question not in questions[]', () => {
            dialogRefSpy.afterClosed.and.callFake(() => of({ ...mockQuestions[1] }));
            component.openEditQuestionDialog({ ...mockQuestions[0] });
            mockQuestionEditedSubject.next({ ...mockQuestions[1] });
            expect(questionHttpServiceSpy.updateQuestion).toHaveBeenCalled();
            expect(component.questions).toEqual([]);
        });

        it('should invokeOnAddQuestion use openAddQuestionDialog logic and add question to questions[]', () => {
            dialogRefSpy.afterClosed.and.callFake(() => of({ ...mockQuestions[0] }));
            component.questionInteractionService.invokeOnAddQuestion();
            mockQuestionSubject.next({ ...mockQuestions[0] });
            expect(component.questions).toEqual([{ ...mockQuestions[0] }]);
            expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
        });
    });

    describe('Tests where component.questions is not empty in the begining', () => {
        beforeEach(() => {
            component.questions = [mockQuestions[0]];
            questionHttpServiceSpy.createQuestion.calls.reset();
            questionHttpServiceSpy.updateQuestion.calls.reset();
            questionHttpServiceSpy.deleteQuestionById.calls.reset();
            questionHttpServiceSpy.getAllQuestions.calls.reset();
            dialogServiceSpy.open.calls.reset();
            dialogRefSpy.afterClosed.and.stub();
        });

        it('should invokeOnShare use shareQuestion logic and not call addQuestion', () => {
            // to spy on private method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const addQuestionSpy = spyOn<any>(component, 'addQuestion').and.callThrough();

            component.questionInteractionService.invokeOnShareQuestion(mockQuestions[0]);

            expect(questionSharingServiceSpy.share).toHaveBeenCalled();
            expect(addQuestionSpy).not.toHaveBeenCalled();
        });

        it('should delete a question from questions[] when is submitted is true', () => {
            dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
            component.openDeleteQuestionDialog({ ...mockQuestions[0] });
            booleanSubject.next(true);
            expect(questionHttpServiceSpy.deleteQuestionById).toHaveBeenCalled();
            expect(component.questions).toEqual([]);
        });

        it('should not delete a question from questions[] when is submittedis false', () => {
            dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
            component.openDeleteQuestionDialog({ ...mockQuestions[0] });
            booleanSubject.next(false);
            expect(questionHttpServiceSpy.deleteQuestionById).not.toHaveBeenCalled();
            expect(component.questions).toEqual([mockQuestions[0]]);
        });

        it('should not delete a question from questions[] when is submitted is true and question not in questions[]', () => {
            dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
            component.openDeleteQuestionDialog({ ...mockQuestions[1] });
            booleanSubject.next(true);
            expect(questionHttpServiceSpy.deleteQuestionById).toHaveBeenCalled();
            expect(component.questions).toEqual([mockQuestions[0]]);
        });

        it('should edit an existing question when question is submitted', () => {
            const mockEditQuestion = { ...mockQuestions[0] };
            mockEditQuestion.text = 'hiiiiii';
            dialogRefSpy.afterClosed.and.callFake(() => of({ ...mockEditQuestion }));
            component.openEditQuestionDialog({ ...mockQuestions[0] });
            mockQuestionEditedSubject.next({ ...mockEditQuestion });
            expect(questionHttpServiceSpy.updateQuestion).toHaveBeenCalled();
            expect(component.questions).toEqual([mockEditQuestion]);
        });

        it('should invokeOnEditQuestion use openEditQuestionDialog logic and edit targetted question', () => {
            const mockEditQuestion = { ...mockQuestions[0] };
            mockEditQuestion.text = 'hiiiiii';
            dialogRefSpy.afterClosed.and.callFake(() => of({ ...mockEditQuestion }));
            component.questionInteractionService.invokeOnEditQuestion({ ...mockQuestions[0] });
            mockQuestionEditedSubject.next({ ...mockEditQuestion });
            expect(questionHttpServiceSpy.updateQuestion).toHaveBeenCalled();
            expect(component.questions).toEqual([mockEditQuestion]);
        });

        it('should invokeOnDelete use openDeleteQuestionDialog logic and delete targetted question', () => {
            dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
            component.questionInteractionService.invokeOnDeleteQuestion({ ...mockQuestions[0] });
            booleanSubject.next(true);
            expect(questionHttpServiceSpy.deleteQuestionById).toHaveBeenCalled();
            expect(component.questions).toEqual([]);
        });
    });
});
