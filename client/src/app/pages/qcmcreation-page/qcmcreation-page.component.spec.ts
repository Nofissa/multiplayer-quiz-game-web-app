import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { QCMCreationPageComponent } from './qcmcreation-page.component';
import { ActivatedRoute } from '@angular/router';
import {  Subject, of } from 'rxjs';
//import { By } from '@angular/platform-browser';
import { Quiz } from '@app/interfaces/quiz';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { QuizHttpService } from '@app/services/quiz-http.service';

fdescribe('QCMCreationPageComponent', () => {
    let component: QCMCreationPageComponent;
    let fixture: ComponentFixture<QCMCreationPageComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>
    let mockQuestionSubject: Subject<Question>;
    let mockQuizSubject: Subject<Quiz>;
    let quizHttpServiceSpy: jasmine.SpyObj<QuizHttpService>;

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
    

    describe ('tests with no quizId in url', () => {
        beforeEach(() => {
            mockQuestionSubject = new Subject();
            mockQuizSubject = new Subject();

            dialogRefSpy = jasmine.createSpyObj('MatDialogRef<UpsertQuestionDialogComponent>', ['afterClosed']);
            dialogSpy = jasmine.createSpyObj(MatDialog, ['open']);

            dialogRefSpy.afterClosed.and.callFake(() => mockQuestionSubject);
            dialogSpy.open.and.returnValue(dialogRefSpy);

            quizHttpServiceSpy = jasmine.createSpyObj('QuizHttpService', ['updateQuiz', 'createQuiz', 'getQuizById']);
            quizHttpServiceSpy.createQuiz.and.callFake(() => mockQuizSubject);
            quizHttpServiceSpy.updateQuiz.and.callFake(() => mockQuizSubject);

            const paramMap = jasmine.createSpyObj('ParamMap', ['get']);
            paramMap.get.and.returnValue(undefined); 
            
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
                    { provide: ActivatedRoute, useValue: activatedRouteSpy },
                    { provide: MatSnackBar, useValue: matSnackBarSpy },
                ],
                imports: [HttpClientModule, MatSnackBarModule],
            });

            snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
            fixture = TestBed.createComponent(QCMCreationPageComponent);
            component = fixture.componentInstance;

            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
            expect(snackBarSpy.open).not.toHaveBeenCalled();
        });

        it('should openQuestionDialog open the upset question dialog', ()=> {
            component.openQuestionDialog();
            expect(dialogSpy.open).toHaveBeenCalled();
        });

        it('should openQuestionDialog add a question', ()=> {
            component.questionsContainer = [];
            component.openQuestionDialog();
            mockQuestionSubject.next(mockQuestion);
            expect(component.questionsContainer.length).toBe(1);
        });

        it('should openQuestionDialog be able to edit a question', ()=> {
            component.questionsContainer = [mockQuestion];
            component.openQuestionDialog('Modifier une question', mockQuestion);
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
            quizHttpServiceSpy.getQuizById.and.callFake((quizId )=>of(mockQuiz));
    
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
                    { provide: ActivatedRoute, useValue: activatedRouteSpy },
                    { provide: MatSnackBar, useValue: matSnackBarSpy },
                ],
                imports: [HttpClientModule, MatSnackBarModule],
            });
    
            snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
            fixture = TestBed.createComponent(QCMCreationPageComponent);
            component = fixture.componentInstance;
            mockQuizSubject.next(mockQuiz);
  

            fixture.detectChanges();
        });

        it('should present all fileds from quiz when modifying one', ()=> {

            expect(quizHttpServiceSpy.getQuizById).toHaveBeenCalled();
            expect(component.formGroup.value.title).toBe(mockQuiz.title);
        });
    });






});
