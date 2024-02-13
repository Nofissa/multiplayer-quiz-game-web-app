/* eslint-disable max-lines */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QCMCreationPageComponent } from './qcmcreation-page.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { Quiz } from '@app/interfaces/quiz';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import SpyObj = jasmine.SpyObj;
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { FormBuilder } from '@angular/forms';
import { throwError } from 'rxjs/internal/observable/throwError';

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
    let mockQuestion: Question;
    let mockEditedQuestion: Question;
    let mockQuiz: Quiz;
    let mockEditedQuiz: Quiz;

    const basicBeforeAll = (): void => {
        mockQuestion = {
            type: 'QCM',
            text: 'some question ?',
            choices: [
                {
                    text: 'some text 1',
                    isCorrect: true,
                },
                {
                    text: 'some text 2',
                    isCorrect: false,
                },
            ],
            lastModification: new Date(),
            points: 10,
            _id: 'some basic Id',
        };

        mockEditedQuestion = {
            type: 'QCM',
            text: 'some other test string',
            choices: [
                {
                    text: 'some text 1',
                    isCorrect: true,
                },
                {
                    text: 'some text 2',
                    isCorrect: false,
                },
            ],
            lastModification: new Date(),
            points: 50,
            // eslint-disable-next-line no-underscore-dangle
            _id: mockQuestion._id,
        };

        mockQuiz = {
            id: 'Some ID',
            title: 'Some Title here',
            description: 'Some description here',
            duration: 10,
            questions: [mockQuestion],
            isHidden: true,
            lastModification: new Date(),
            _id: '',
        };

        mockEditedQuiz = {
            id: 'Some ID',
            title: 'Some other Title here',
            description: 'Some other description here',
            duration: 10,
            questions: [mockEditedQuestion],
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
        questionSharingServiceSpy['callbacks'] = [];
        questionSharingServiceSpy.subscribe.and.callFake((callback: (data: Question) => void) => {
            questionSharingServiceSpy['callbacks'].push(callback);
        });
        questionSharingServiceSpy.share.and.callFake((question: Question) => {
            questionSharingServiceSpy['callbacks'].forEach((callback: (data: Question) => void) => {
                callback(question);
            });
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
            component.questionInteractionService.invokeOnShareQuestion(mockQuestion);
            expect(questionSharingServiceSpy.share).toHaveBeenCalled();
        });

        it('should submitQuiz update quiz if all fileds are valid and quiz exists', () => {
            component.quiz = mockQuiz;
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
            component.quiz = mockQuiz;
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
            component.formGroup.controls.title.patchValue(mockQuiz.title);
            component.formGroup.controls.description.patchValue(mockQuiz.description);
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

            it('should invokeOnAddQuestion call addQuestion QuestionInteractionService', () => {
                component.questionInteractionService.invokeOnAddQuestion();
                mockQuestionSubject.next(mockQuestion);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestion]);
            });

            it('should add question to questionsContainer if empty on invokeOnShareQuestion', () => {
                component.questionInteractionService.invokeOnShareQuestion(mockQuestion);
                expect(component.questionsContainer).toContain(mockQuestion);
            });

            it('should addQuestion add question to array if data is valid', () => {
                component.addQuestion();
                mockQuestionSubject.next(mockQuestion);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestion]);
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
                component.questionsContainer = [{ ...mockQuestion }];
                reset();
            });

            it('should not add question to questionsContainer if already contained on invokeOnShareQuestion', () => {
                component.questionInteractionService.invokeOnShareQuestion(mockQuestion);
                expect(component.questionsContainer).toContain(mockQuestion);
            });

            it('should invokeOnEditQuestion open edit upsert dialog QuestionInteractionService', () => {
                component.questionInteractionService.invokeOnEditQuestion(component.questionsContainer[0]);
                mockQuestionSubject.next(mockEditedQuestion);
                fixture.detectChanges();
                expect(dialogSpy.open).toHaveBeenCalled();
                expect(component.questionsContainer).toEqual([mockEditedQuestion]);
            });

            it('should invokeOnEditQuestion open edit upsert dialog QuestionInteractionService but not edit question when data is not valid', () => {
                component.questionInteractionService.invokeOnEditQuestion(undefined as unknown as Question);
                fixture.detectChanges();
                expect(dialogSpy.open).toHaveBeenCalled();
                expect(component.questionsContainer).toEqual([mockQuestion]);
            });

            it('should invokeOnDeleteQuestion call deleteQuestion QuestionInteractionService', () => {
                component.questionInteractionService.invokeOnDeleteQuestion(mockQuestion);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([]);
            });

            it('should deleteQuestion not delete any question if question not present in questions[]', () => {
                component.deleteQuestion(mockEditedQuestion);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestion]);
            });

            it('should deleteQuestion not delete any question if data is not valid', () => {
                component.deleteQuestion(undefined as unknown as Question);
                fixture.detectChanges();
                expect(component.questionsContainer).toEqual([mockQuestion]);
            });

            it('should submitQuiz create quiz if all fileds are valid and quiz does not exist', () => {
                component.formGroup.controls.title.patchValue(mockQuiz.title);
                component.formGroup.controls.description.patchValue(mockQuiz.description);
                component.submitQuiz();
                mockQuizSubject.next(mockQuiz);
                fixture.detectChanges();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.createQuiz).toHaveBeenCalled();
            });

            it('should submitQuiz not create quiz if all fileds are valid and quiz does not exist but error is thrown', () => {
                component.formGroup.controls.title.patchValue(mockQuiz.title);
                component.formGroup.controls.description.patchValue(mockQuiz.description);
                component.submitQuiz();
                mockQuizSubject.error(throwError(() => new Error('This is an error')));
                fixture.detectChanges();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.createQuiz).toHaveBeenCalled();
                expect(snackBarSpy.open).toHaveBeenCalled();
            });

            it('should SubmitQuiz not be able to submit a quiz when quiz title is empty', () => {
                component.formGroup.controls.description.patchValue(mockQuiz.description);
                component.submitQuiz();
                fixture.detectChanges();
                expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
                expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
                expect(snackBarSpy.open).toHaveBeenCalled();
            });

            it('should SubmitQuiz not be able to submit a quiz when quiz description is empty', () => {
                component.formGroup.controls.title.patchValue(mockQuiz.title);
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

            quizHttpServiceSpy.getQuizById.and.callFake(() => of(mockQuiz));

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
            expect(component.quiz).toEqual(mockQuiz);
            expect(component.formGroup.value.title).toBe(mockQuiz.title);
            expect(component.formGroup.value.description).toBe(mockQuiz.description);
            expect(component.questionsContainer).toEqual(mockQuiz.questions);
        });
    });
});
