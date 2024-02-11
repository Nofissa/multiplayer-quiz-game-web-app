import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionBankComponent } from './question-bank.component';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionServicesProvider } from '@app/providers/question-services.provider';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { Question } from '@app/interfaces/question';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { QuestionHttpService } from '@app/services/question-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

fdescribe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;

    let materialServicesProviderSpy: SpyObj<MaterialServicesProvider>;
    let dialogServiceSpy: SpyObj<MatDialog>;
    let dialogRefSpy: SpyObj<MatDialogRef<Question>>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    let questionServicesProviderSpy: SpyObj<QuestionServicesProvider>;
    let questionHttpServiceSpy: SpyObj<QuestionHttpService>;
    let questionSharingServiceSpy: SpyObj<QuestionSharingService>;

    let questionInteractionServiceSpy: SpyObj<QuestionInteractionService>;
    const mockQuestion: Question = {
        type: 'QCM',
        text: 'Some string',
        points: 10,
        choices: [{
            text: 'Some choice 1', 
            isCorrect: true,
        },
        {
            text: 'Some choice 2', 
            isCorrect: false,
        }],
        lastModification: new Date(),
        _id: 'some string',
    }
    let mockQuestionsArray: Question[];
    mockQuestionsArray = [mockQuestion];

    // let mockQuestionSubject: Subject<Question>;

    beforeEach(async () => {
        // mockQuestionSubject = new Subject();
        questionInteractionServiceSpy = jasmine.createSpyObj('QuestionInteractionService', ['registerOnAddQuestion', 'registerOnEditQuestion', 'registerOnDeleteQuestion', 'registerOnShareQuestion']);
        //cut off to isolate testing environment
        questionInteractionServiceSpy.registerOnAddQuestion.and.stub();
        questionInteractionServiceSpy.registerOnDeleteQuestion.and.stub();
        questionInteractionServiceSpy.registerOnEditQuestion.and.stub();
        questionInteractionServiceSpy.registerOnShareQuestion.and.stub();

        questionHttpServiceSpy = jasmine.createSpyObj('QuestionHttpService', ['getAllQuestions', 'updateQuestion', 'deleteQuestionById', 'createQuestion']);
        questionHttpServiceSpy.getAllQuestions.and.returnValue(of(mockQuestionsArray));
        questionHttpServiceSpy.createQuestion.and.returnValue(of(mockQuestion));

        questionSharingServiceSpy = jasmine.createSpyObj('QuestionSharingService', ['share', 'subscribe']);
        //cut off to isolate testing environment
        questionSharingServiceSpy.share.and.stub();
        questionSharingServiceSpy.subscribe.and.stub();

        questionServicesProviderSpy = new QuestionServicesProvider(questionHttpServiceSpy, questionSharingServiceSpy) as jasmine.SpyObj<QuestionServicesProvider>;

        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(mockQuestion));
        dialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogServiceSpy.open.and.returnValue(dialogRefSpy);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);


        materialServicesProviderSpy = new MaterialServicesProvider(dialogServiceSpy, snackBarSpy) as SpyObj<MaterialServicesProvider>;

        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
            providers: [
                { provide: MaterialServicesProvider, useValue: materialServicesProviderSpy }, 
                { provide: QuestionServicesProvider, useValue: questionServicesProviderSpy },
                { provide: QuestionInteractionService, useValue: questionInteractionServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(questionHttpServiceSpy.getAllQuestions).toHaveBeenCalled();
    });

    it('should addQuestion add a question to questions[]', ()=> {
        component.questions = [];
        component.openAddQuestionDialog();
        expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
        expect(component.questions).toEqual(mockQuestionsArray);
    });

    it('', ()=> {

    });

    it('', ()=> {

    });

});