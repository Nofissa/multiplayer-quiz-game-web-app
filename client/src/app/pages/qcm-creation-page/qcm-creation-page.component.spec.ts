/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Quiz } from '@common/quiz';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { Question } from '@common/question';
import { Subject, of, throwError } from 'rxjs';
import { QCMCreationPageComponent } from './qcm-creation-page.component';
import SpyObj = jasmine.SpyObj;

describe('QCMCreationPageComponent', () => {
    let component: QCMCreationPageComponent;
    let fixture: ComponentFixture<QCMCreationPageComponent>;
    let snackBarSpy: SpyObj<MatSnackBar>;
    let dialogSpy: SpyObj<MatDialog>;
    let dialogRefSpy: SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
    let quizHttpServiceSpy: SpyObj<QuizHttpService>;
    let questionSharingServiceSpy: SpyObj<QuestionSharingService>;
    let matServiceProvierSpy: SpyObj<MaterialServicesProvider>;
    let mockQuestionSubject: Subject<Question>;
    let mockQuizSubject: Subject<Quiz>;
    let mockQuestions: Question[];
    let mockQuizs: Quiz;
    let mockEditedQuiz: Quiz;

    const basicBeforeAll = (): void => {
        mockQuestions = qcmQuestionStub();

        mockQuizs = quizStub();

        mockEditedQuiz = {
            id: 'Some ID',
            title: 'Some other Title here',
            description: 'Some other description here',
            duration: 10,
            questions: [mockQuestions[1]],
            isHidden: true,
            lastModification: new Date(),
            _id: '',
        };

        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        snackBarSpy.open.and.stub();
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<UpsertQuestionDialogComponent>', ['afterClosed']);
        dialogRefSpy.afterClosed.and.callFake(() => mockQuestionSubject);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogSpy.open.and.returnValue(dialogRefSpy);
        quizHttpServiceSpy = jasmine.createSpyObj('QuizHttpService', ['updateQuiz', 'createQuiz', 'getQuizById']);
        quizHttpServiceSpy.createQuiz.and.callFake(() => mockQuizSubject);
        quizHttpServiceSpy.updateQuiz.and.callFake(() => mockQuizSubject);
        questionSharingServiceSpy = jasmine.createSpyObj('QuestionSharingService', ['share', 'subscribe']);
        questionSharingServiceSpy['shareSubject'] = new Subject();
        questionSharingServiceSpy.subscribe.and.callFake((callback: (question: Question) => void) => {
            return questionSharingServiceSpy['shareSubject'].subscribe(callback);
        });
        questionSharingServiceSpy.share.and.callFake((question: Question) => {
            questionSharingServiceSpy['shareSubject'].next(question);
        });
        matServiceProvierSpy = new MaterialServicesProvider(dialogSpy, snackBarSpy) as SpyObj<MaterialServicesProvider>;
        mockQuestionSubject = new Subject<Question>();
        mockQuizSubject = new Subject<Quiz>();
    };

    const reset = (): void => {
        component.formGroup.controls.title.patchValue('');
        component.formGroup.controls.description.patchValue('');
        dialogSpy.open.calls.reset();
        quizHttpServiceSpy.createQuiz.calls.reset();
        quizHttpServiceSpy.updateQuiz.calls.reset();
        component.quiz = undefined as unknown as Quiz;
    };

    describe('tests with no quizId in url', () => {
        beforeEach(async () => {
            basicBeforeAll();
            const paramMap = jasmine.createSpyObj('ParamMap', ['get']);
            paramMap.get.and.returnValue(undefined);

            const activatedRouteSpy = {
                queryParamMap: of(paramMap),
            };

            quizHttpServiceSpy.getQuizById.and.callFake(() => of());

            await TestBed.configureTestingModule({
                declarations: [QCMCreationPageComponent],
                providers: [
                    FormBuilder,
                    { provide: ActivatedRoute, useValue: activatedRouteSpy },
                    { provide: QuizHttpService, useValue: quizHttpServiceSpy },
                    { provide: QuestionSharingService, useValue: questionSharingServiceSpy },
                    QuestionInteractionService,
                    { provide: MaterialServicesProvider, useValue: matServiceProvierSpy },
                ],
                imports: [HttpClientModule],
            });
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(QCMCreationPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
            expect(questionSharingServiceSpy.subscribe).toHaveBeenCalled();
        });

        it('should call questionService share with invokeOnShareQuestion', () => {
            component.questionInteractionService.invokeOnShareQuestion(mockQuestions[0]);
            expect(questionSharingServiceSpy.share).toHaveBeenCalled();
        });

        it('should submitQuiz update quiz if all fileds are valid and quiz exists', () => {
            component.quiz = mockQuizs;
            component.formGroup.controls.title.patchValue(mockEditedQuiz.title);
            component.formGroup.controls.description.patchValue(mockEditedQuiz.description);
            component.questionsContainer = mockEditedQuiz.questions;
            component.submitQuiz();
            mockQuizSubject.next(mockEditedQuiz);
            fixture.detectChanges();
            expect(quizHttpServiceSpy.updateQuiz).toHaveBeenCalled();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
        });

        it('should submitQuiz not update quiz if all fileds are valid and quiz exists but error is thrown', () => {
            component.quiz = mockQuizs;
            component.formGroup.controls.title.patchValue(mockEditedQuiz.title);
            component.formGroup.controls.description.patchValue(mockEditedQuiz.description);
            component.questionsContainer = mockEditedQuiz.questions;
            component.submitQuiz();
            mockQuizSubject.error(throwError(() => new Error('This is an error')));
            fixture.detectChanges();
            expect(quizHttpServiceSpy.updateQuiz).toHaveBeenCalled();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });

        it('should submitQuiz open a snack bar if all fields are not valid', () => {
            component.submitQuiz();
            fixture.detectChanges();
            expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });

        it('should SubmitQuiz not be able to submit a quiz when there are no questions', () => {
            component.formGroup.controls.title.patchValue(mockQuizs.title);
            component.formGroup.controls.description.patchValue(mockQuizs.description);
            component.submitQuiz();
            fixture.detectChanges();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
            expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });

        describe('Tests with empty questionContainer', () => {
            beforeEach(() => {
                component.questionsContainer = [];
                reset();
            });

            it('should invokeOnAddQuestion call addQuestion', () => {
                component.questionInteractionService.invokeOnAddQuestion();
                mockQuestionSubject.next(mockQuestions[0]);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestions[0]]);
            });

            it('should add question to questionsContainer if empty on invokeOnShareQuestion', () => {
                component.questionInteractionService.invokeOnShareQuestion(mockQuestions[0]);
                expect(component.questionsContainer).toContain(mockQuestions[0]);
            });

            it('should addQuestion add question to array if data is valid', () => {
                component.addQuestion();
                mockQuestionSubject.next(mockQuestions[0]);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestions[0]]);
            });

            it('should addQuestion not add question to array if data is not valid', () => {
                component.addQuestion();
                mockQuestionSubject.next(undefined as unknown as Question);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([]);
            });

            it('should addQuestion open question creation dialog', () => {
                component.addQuestion();
                fixture.detectChanges();
                expect(dialogSpy.open).toHaveBeenCalled();
            });
        });

        describe('Tests with non-empty questionContainer', () => {
            beforeEach(() => {
                component.questionsContainer = [{ ...mockQuestions[0] }];
                reset();
            });

            it('should not add question to questionsContainer if already contained on invokeOnShareQuestion', () => {
                component.questionInteractionService.invokeOnShareQuestion(mockQuestions[0]);
                expect(component.questionsContainer).toContain(mockQuestions[0]);
            });

            it('should invokeOnEditQuestion open edit upsert dialog QuestionInteractionService', () => {
                const mockEditedQuestion = { ...mockQuestions[0] };
                mockEditedQuestion.text = 'hiiii';
                component.questionInteractionService.invokeOnEditQuestion(component.questionsContainer[0]);
                mockQuestionSubject.next({ ...mockEditedQuestion });
                fixture.detectChanges();
                expect(dialogSpy.open).toHaveBeenCalled();
                expect(component.questionsContainer).toEqual([mockEditedQuestion]);
            });

            it('should invokeOnEditQuestion open edit upsert dialog QuestionInteractionService but not edit question when data is not valid', () => {
                component.questionInteractionService.invokeOnEditQuestion(undefined as unknown as Question);
                fixture.detectChanges();
                expect(dialogSpy.open).toHaveBeenCalled();
                expect(component.questionsContainer).toEqual([mockQuestions[0]]);
            });

            it('should invokeOnDeleteQuestion call deleteQuestion QuestionInteractionService', () => {
                component.questionInteractionService.invokeOnDeleteQuestion(mockQuestions[0]);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([]);
            });

            it('should deleteQuestion not delete any question if question not present in questions[]', () => {
                component.deleteQuestion(mockQuestions[1]);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestions[0]]);
            });

            it('should deleteQuestion not delete any question if data is not valid', () => {
                component.deleteQuestion(undefined as unknown as Question);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestions[0]]);
            });

            it('should submitQuiz create quiz if all fileds are valid and quiz does not exist', () => {
                component.formGroup.controls.title.patchValue(mockQuizs.title);
                component.formGroup.controls.description.patchValue(mockQuizs.description);
                component.submitQuiz();
                mockQuizSubject.next(mockQuizs);
                fixture.detectChanges();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.createQuiz).toHaveBeenCalled();
            });

            it('should submitQuiz not create quiz if all fileds are valid and quiz does not exist but error is thrown', () => {
                component.formGroup.controls.title.patchValue(mockQuizs.title);
                component.formGroup.controls.description.patchValue(mockQuizs.description);
                component.submitQuiz();
                mockQuizSubject.error(throwError(() => new Error('This is an error')));
                fixture.detectChanges();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.createQuiz).toHaveBeenCalled();
                expect(snackBarSpy.open).toHaveBeenCalled();
            });

            it('should SubmitQuiz not be able to submit a quiz when quiz title is empty', () => {
                component.formGroup.controls.description.patchValue(mockQuizs.description);
                component.submitQuiz();
                fixture.detectChanges();
                expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(snackBarSpy.open).toHaveBeenCalled();
            });

            it('should SubmitQuiz not be able to submit a quiz when quiz description is empty', () => {
                component.formGroup.controls.title.patchValue(mockQuizs.title);
                component.submitQuiz();
                fixture.detectChanges();
                expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(snackBarSpy.open).toHaveBeenCalled();
            });
        });
    });

    describe('tests with a different before each', () => {
        beforeEach(async () => {
            basicBeforeAll();
            const paramMap = jasmine.createSpyObj('ParamMap', ['get']);
            paramMap.get.and.returnValue('someQuizId');

            const activatedRouteSpy = { queryParamMap: of(paramMap) };

            quizHttpServiceSpy.getQuizById.and.callFake(() => of(mockQuizs));

            await TestBed.configureTestingModule({
                declarations: [QCMCreationPageComponent],
                providers: [
                    FormBuilder,
                    { provide: ActivatedRoute, useValue: activatedRouteSpy },
                    { provide: QuizHttpService, useValue: quizHttpServiceSpy },
                    { provide: QuestionSharingService, useValue: questionSharingServiceSpy },
                    QuestionInteractionService,
                    { provide: MaterialServicesProvider, useValue: matServiceProvierSpy },
                ],
                imports: [HttpClientModule],
            });
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(QCMCreationPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should present all fields from quiz when modifying one', () => {
            expect(quizHttpServiceSpy.getQuizById).toHaveBeenCalled();
            expect(component.quiz).toEqual(mockQuizs);
            expect(component.formGroup.value.title).toBe(mockQuizs.title);
            expect(component.formGroup.value.description).toBe(mockQuizs.description);
            expect(component.questionsContainer).toEqual(mockQuizs.questions);
        });
    });
});
