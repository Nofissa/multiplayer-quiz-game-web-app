import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QCMCreationPageComponent } from './qcmcreation-page.component';
import { ActivatedRoute } from '@angular/router';
import {  Subject, of } from 'rxjs';
//import { By } from '@angular/platform-browser';
import { Quiz } from '@app/interfaces/quiz';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { QuizHttpService } from '@app/services/quiz-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import SpyObj = jasmine.SpyObj;
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { FormBuilder } from '@angular/forms';

describe('QCMCreationPageComponent', () => {
    let component: QCMCreationPageComponent;    
    let fixture: ComponentFixture<QCMCreationPageComponent>;

    let snackBarSpy: SpyObj<MatSnackBar>;
    let dialogSpy: SpyObj<MatDialog>;
    let dialogRefSpy: SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>
    let quizHttpServiceSpy: SpyObj<QuizHttpService>;
    let questionSharingServiceSpy: SpyObj<QuestionSharingService>;
    let questionInteractionServiceSpy: SpyObj<QuestionInteractionService>;
    let matServiceProvierSpy: SpyObj<MaterialServicesProvider>;

    let mockQuestionSubject: Subject<Question>;
    let mockQuizSubject: Subject<Quiz>;


    const mockQuestion: Question = 
        {
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

    const mockQuiz: Quiz = 
        {
            id: 'Some ID',
            title: 'Some Title here',
            description: 'Some description here',
            duration: 10,
            questions: [mockQuestion],
            isHidden: true,
            lastModification: new Date(),
            _id: '',
        };
    

    fdescribe ('tests with no quizId in url', () => {
        beforeEach(async () => {

            snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
            snackBarSpy.open.and.stub();

            dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
            dialogSpy.open.and.returnValue(dialogRefSpy);

            dialogRefSpy = jasmine.createSpyObj('MatDialogRef<UpsertQuestionDialogComponent>', ['afterClosed']);
            dialogRefSpy.afterClosed.and.callFake(() => mockQuestionSubject);

            quizHttpServiceSpy = jasmine.createSpyObj('QuizHttpService', ['updateQuiz', 'createQuiz', 'getQuizById']);
            quizHttpServiceSpy.createQuiz.and.callFake(() => mockQuizSubject);
            quizHttpServiceSpy.updateQuiz.and.callFake(() => mockQuizSubject);
            quizHttpServiceSpy.getQuizById.and.callFake(()=> of());

            questionSharingServiceSpy = jasmine.createSpyObj('QuestionSharingService', ['']);

            questionInteractionServiceSpy = jasmine.createSpyObj('QuestionInteractionService', ['']);

            matServiceProvierSpy = new MaterialServicesProvider(dialogSpy, snackBarSpy) as SpyObj<MaterialServicesProvider>;

            mockQuestionSubject = new Subject<Question>;
            mockQuizSubject = new Subject<Quiz>;

            const paramMap = jasmine.createSpyObj('ParamMap', ['get']);
            paramMap.get.and.returnValue(undefined); 
            
            const activatedRouteSpy = {
                queryParamMap: of(paramMap),
            };

            await TestBed.configureTestingModule({
                declarations: [QCMCreationPageComponent],
                providers: [
                    FormBuilder, 
                    { provide: ActivatedRoute, useValue: activatedRouteSpy },
                    { provide: QuizHttpService, useValue: quizHttpServiceSpy },
                    { provide: QuestionSharingService, useValue: questionSharingServiceSpy },
                    { provide: QuestionInteractionService, useValue: questionInteractionServiceSpy },
                    { provide: MaterialServicesProvider, useValue: matServiceProvierSpy },
                    
                ],
                imports: [HttpClientModule],
            }).compileComponents();

        });

        beforeEach(()=> {
            fixture = TestBed.createComponent(QCMCreationPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });


        it('should create', () => {
            expect(component).toBeTruthy();

            //TODO
            expect(questionSharingServiceSpy.subscribe).toHaveBeenCalledWith((question: Question) => {
                // eslint-disable-next-line no-underscore-dangle
                if (!component.questionsContainer.find((x) => x._id === question._id)) {
                    component.questionsContainer.push(question);
                }
            });
        });

        //TODO
        it('should invokeOnAddQuestion call addQuestion QuestionInteractionService', () => {
            expect(component).toBeTruthy();
        });        

        //TODO
        it('should invokeOnShareQuestion call questionService share QuestionInteractionService', () => {
            expect(component).toBeTruthy();
        });   


        //TODO
        it('should invokeOnEditQuestion open edit upsert dialog QuestionInteractionService', () => {
            expect(component).toBeTruthy();
        });   


        //TODO
        it('should invokeOnDeleteQuestion call deleteQuestion QuestionInteractionService', () => {
            expect(component).toBeTruthy();
        });   

        //TODO
        it('should deleteQuestion delete question if present in questions[]', () => {
            expect(component).toBeTruthy();
        });   

        //TODO
        it('should deleteQuestion not delete any question if question not present in questions[]', () => {
            expect(component).toBeTruthy();
        });   

        //TODO
        it('should addQuestion add question to array if data is valid', () => {
            expect(component).toBeTruthy();
        });   

        //TODO
        it('should addQuestion not add question to array if data is not valid', () => {
            expect(component).toBeTruthy();
        });

        //TODO
        it('should addQuestion open question creation dialog', () => {
            expect(component).toBeTruthy();
        });

        //TODO
        it('should submitQuiz create quiz if all fileds are valid and quiz does not exist', () => {
            expect(component).toBeTruthy();
        });

        //TODO
        it('should submitQuiz not create quiz if all fileds are valid and quiz does not exist but error is thrown', () => {
            expect(component).toBeTruthy();
        });

        //TODO
        it('should submitQuiz update quiz if all fileds are valid and quiz exists', () => {
            expect(component).toBeTruthy();
        });

        //TODO
        it('should submitQuiz not update quiz if all fileds are valid and quiz exists but error is thrown', () => {
            expect(component).toBeTruthy();
        });

        //TODO
        it('should submitQuiz open a snack bar if all fields are not valid', () => {
            expect(component).toBeTruthy();
        });

        it('should openQuestionDialog add a question', ()=> {
            component.questionsContainer = [];
            component.addQuestion();
            mockQuestionSubject.next(mockQuestion);
            expect(component.questionsContainer.length).toBe(1);
        });

        it('should openQuestionDialog be able to edit a question', ()=> {
            component.questionsContainer = [mockQuestion];
            component.questionInteractionService.invokeOnEditQuestion(mockQuestion);
            mockQuestionSubject.next(mockQuestion);
            expect(component.questionsContainer.length).toBe(1);
        });

        it('should deleteQuestion be able to delete a question', ()=> {
            component.questionsContainer = [mockQuestion];
            component.deleteQuestion(mockQuestion);
        });

        it('should be able to share a question to the quiz bank', ()=> {
            
        });

        it('should be able to submit a quiz when quiz requierments are met', ()=> {
            component.questionsContainer = [mockQuestion];
            component.formGroup.controls.title.patchValue(mockQuiz.title);
            component.formGroup.controls.description.patchValue(mockQuiz.description);
            component.submitQuiz();
            mockQuizSubject.next(mockQuiz);
            expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
            expect(quizHttpServiceSpy.createQuiz).toHaveBeenCalled();
        });

        it('should not be able to submit a quiz when quiz title is empty', ()=> {
            component.questionsContainer = [mockQuestion];
            component.formGroup.controls.description.patchValue(mockQuiz.description);
            component.submitQuiz();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
            expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });

        it('should not be able to submit a quiz when quiz description is empty', ()=> {
            component.questionsContainer = [mockQuestion];
            component.formGroup.controls.title.patchValue(mockQuiz.title);
            component.submitQuiz();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
            expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });

        it('should not be able to submit a quiz when there are no questions', ()=> {
            component.formGroup.controls.title.patchValue(mockQuiz.title);
            component.formGroup.controls.description.patchValue(mockQuiz.description);
            component.submitQuiz();
            expect(quizHttpServiceSpy.createQuiz).not.toHaveBeenCalled();
            expect(quizHttpServiceSpy.updateQuiz).not.toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });

        it('should be able to share a question from the question bank to the quiz', ()=> {
            
        });

    });

    // it('should be able to get the id from the url', ()=> {
        
    // });
    //requires a different before each

    describe ("tests with a different before each", () => {
        let quizSpy: jasmine.SpyObj<QuizHttpService>;
        let questionSharing : jasmine.SpyObj<QuestionInteractionService>;
        beforeEach(() => {
            mockQuestionSubject = new Subject();
            mockQuizSubject = new Subject();
    
            dialogRefSpy = jasmine.createSpyObj('MatDialogRef<UpsertQuestionDialogComponent>', ['afterClosed']);
            dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    
            dialogRefSpy.afterClosed.and.callFake(() => mockQuestionSubject);
            dialogSpy.open.and.returnValue(dialogRefSpy);
    
            quizHttpServiceSpy = jasmine.createSpyObj('QuizHttpService', ['updateQuiz', 'createQuiz', 'getQuizById']);
            quizHttpServiceSpy.createQuiz.and.callFake((quiz)=>mockQuizSubject);
            quizHttpServiceSpy.updateQuiz.and.callFake((quiz)=>mockQuizSubject);
            quizHttpServiceSpy.getQuizById.and.callFake((quizId )=>mockQuizSubject);

            questionSharing = jasmine.createSpyObj('QuestionInteractionService', ['registerOnEditQuestion']);
            questionSharing.registerOnEditQuestion.and.callFake(()=> console.log('AAAAAAAAAAAAAAA'));
    
            const paramMap = jasmine.createSpyObj('ParamMap', ['get']);
            paramMap.get.and.returnValue('mockedQuizId'); 
            
            const activatedRouteSpy = {
                queryParamMap: of(paramMap),
            };

            const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    
            TestBed.configureTestingModule({
                declarations: [QCMCreationPageComponent],
                providers: [
                    { provide: MatDialog, useValue: dialogSpy },
                    { provide: MatDialogRef, useValue: dialogRefSpy },
                    { provide: QuizHttpService, useValue: quizHttpServiceSpy },
                    { provide: QuestionInteractionService, useValue: questionSharing},
                    { provide: ActivatedRoute, useValue: activatedRouteSpy },
                    { provide: MatSnackBar, useValue: matSnackBarSpy },
                ],
                imports: [HttpClientModule],
            });
    
            snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
            quizSpy = TestBed.inject(QuizHttpService) as jasmine.SpyObj<QuizHttpService>;
            fixture = TestBed.createComponent(QCMCreationPageComponent);
            component = fixture.componentInstance;
            //mockQuizSubject.next(mockQuiz);
  

            fixture.detectChanges();
        });

        it('should present all fileds from quiz when modifying one', ()=> {

            expect(quizHttpServiceSpy.getQuizById).toHaveBeenCalled();
            expect(component.formGroup.value.title).toBe(mockQuiz.title);
            expect(quizSpy.getQuizById).toHaveBeenCalled();
        });
    });






});
