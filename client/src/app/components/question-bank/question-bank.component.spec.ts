import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionBankComponent } from './question-bank.component';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionServicesProvider } from '@app/providers/question-services.provider';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { Question } from '@app/interfaces/question';
import { Subject, of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { QuestionHttpService } from '@app/services/question-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;

    let materialServicesProviderSpy: SpyObj<MaterialServicesProvider>;
    let dialogServiceSpy: SpyObj<MatDialog>;
    let dialogRefSpy: SpyObj<MatDialogRef<Question>>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    let questionServicesProviderSpy: SpyObj<QuestionServicesProvider>;
    let questionHttpServiceSpy: SpyObj<QuestionHttpService>;
    let questionSharingServiceSpy: SpyObj<QuestionSharingService>;

    let mockQuestion: Question;
    let editedMockQuestion: Question;

    let mockQuestionSubject: Subject<Question>;
    let mockQuestionEditedSubject: Subject<Question>;
    let booleanSubject: Subject<boolean>;

    beforeEach(async () => {
        mockQuestion = {
            type: 'QCM',
            text: 'Some string',
            points: 10,
            choices: [
                {
                    text: 'Some choice 1',
                    isCorrect: true,
                },
                {
                    text: 'Some choice 2',
                    isCorrect: false,
                },
            ],
            lastModification: new Date(),
            _id: 'some string',
        };
        editedMockQuestion = {
            type: 'QCM',
            text: 'Some string Modified',
            points: 30,
            choices: [
                {
                    text: 'Some choice 1',
                    isCorrect: true,
                },
                {
                    text: 'Some choice 2',
                    isCorrect: false,
                },
            ],
            lastModification: new Date(),
            _id: 'some string',
        };
        mockQuestionSubject = new Subject();
        mockQuestionEditedSubject = new Subject();
        booleanSubject = new Subject();
        questionHttpServiceSpy = jasmine.createSpyObj('QuestionHttpService', [
            'getAllQuestions',
            'updateQuestion',
            'deleteQuestionById',
            'createQuestion',
        ]);
        questionHttpServiceSpy.getAllQuestions.and.returnValue(of([mockQuestion]));
        questionHttpServiceSpy.createQuestion.and.returnValue(mockQuestionSubject);
        questionHttpServiceSpy.updateQuestion.and.returnValue(mockQuestionEditedSubject);
        questionHttpServiceSpy.deleteQuestionById.and.returnValue(of(undefined));

        questionSharingServiceSpy = jasmine.createSpyObj('QuestionSharingService', ['share', 'subscribe']);

        questionServicesProviderSpy = new QuestionServicesProvider(
            questionHttpServiceSpy,
            questionSharingServiceSpy,
        ) as jasmine.SpyObj<QuestionServicesProvider>;

        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogServiceSpy.open.and.returnValue(dialogRefSpy);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        materialServicesProviderSpy = new MaterialServicesProvider(dialogServiceSpy, snackBarSpy) as SpyObj<MaterialServicesProvider>;

        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
            providers: [
                { provide: MaterialServicesProvider, useValue: materialServicesProviderSpy },
                { provide: QuestionServicesProvider, useValue: questionServicesProviderSpy },
                {
                    provide: QuestionInteractionService,
                },
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
        expect(questionSharingServiceSpy.subscribe).toHaveBeenCalled();
    });

    it('should openAddQuestionDialog add a question to questions[] when a question is submitted', () => {
        component.questions = [];
        dialogRefSpy.afterClosed.and.callFake(() => of(mockQuestion));
        component.openAddQuestionDialog();
        mockQuestionSubject.next(mockQuestion);
        expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
        expect(component.questions).toEqual([mockQuestion]);
    });

    it('should openAddQuestionDialog not add a question to questions[] when an error is thrown', () => {
        component.questions = [];
        dialogRefSpy.afterClosed.and.callFake(() => of(mockQuestion));
        questionHttpServiceSpy.createQuestion.and.returnValue(throwError('Simulated Error'));
        component.openAddQuestionDialog();
        mockQuestionSubject.error(undefined);
        expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalled();
        expect(component.questions).toEqual([]);
    });

    it('should openDeleteQuestionDialog delete a question from questions[] when is submitted = true', () => {
        component.questions = [mockQuestion];
        dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
        component.openDeleteQuestionDialog(mockQuestion);
        booleanSubject.next(true);
        expect(questionHttpServiceSpy.deleteQuestionById).toHaveBeenCalled();
        expect(component.questions).toEqual([]);
    });

    it('should openDeleteQuestionDialog not delete a question from questions[] when is submitted = true and question not in questions[', () => {
        const mockQuestionDifferentId = editedMockQuestion;
        mockQuestionDifferentId._id = 'Some id 2';
        component.questions = [mockQuestionDifferentId];
        dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
        component.openDeleteQuestionDialog(mockQuestion);
        booleanSubject.next(true);
        expect(questionHttpServiceSpy.deleteQuestionById).toHaveBeenCalled();
        expect(component.questions).toEqual([mockQuestionDifferentId]);
    });

    it('should openDeleteQuestionDialog not delete a question from questions[] when is submitted = false', () => {
        component.questions = [mockQuestion];
        dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
        component.openDeleteQuestionDialog(mockQuestion);
        booleanSubject.next(false);
        expect(questionHttpServiceSpy.deleteQuestionById).not.toHaveBeenCalled();
        expect(component.questions).toEqual([mockQuestion]);
    });

    it('should openEditQuestionDialog edit an existing question when question is submitted', () => {
        component.questions = [mockQuestion];
        dialogRefSpy.afterClosed.and.callFake(() => of(editedMockQuestion));
        component.openEditQuestionDialog(mockQuestion);
        mockQuestionEditedSubject.next(editedMockQuestion);
        expect(questionHttpServiceSpy.updateQuestion).toHaveBeenCalled();
        expect(component.questions).toEqual([editedMockQuestion]);
    });

    it('should openEditQuestionDialog not edit an existing question when question is submitted and question not in questions[]', () => {
        component.questions = [];
        dialogRefSpy.afterClosed.and.callFake(() => of(editedMockQuestion));
        component.openEditQuestionDialog(mockQuestion);
        mockQuestionEditedSubject.next(editedMockQuestion);
        expect(questionHttpServiceSpy.updateQuestion).toHaveBeenCalled();
        expect(component.questions).toEqual([]);
    });

    it('should invokeOnAddQuestion call openAddQuestionDialog QuestionIteractionService', () => {
        component.questions = [];
        dialogRefSpy.afterClosed.and.callFake(() => of(mockQuestion));
        component.questionInteractionService.invokeOnAddQuestion();
        mockQuestionSubject.next(mockQuestion);
        expect(component.questions).toEqual([mockQuestion]);
        expect(questionHttpServiceSpy.createQuestion).toHaveBeenCalled();
    });

    it('should invokeOnEditQuestion call openEditQuestionDialog QuestionIteractionService', () => {
        component.questions = [mockQuestion];
        dialogRefSpy.afterClosed.and.callFake(() => of(editedMockQuestion));
        component.questionInteractionService.invokeOnEditQuestion(mockQuestion);
        mockQuestionEditedSubject.next(editedMockQuestion);
        expect(questionHttpServiceSpy.updateQuestion).toHaveBeenCalled();
        expect(component.questions).toEqual([editedMockQuestion]);
    });

    it('should invokeOnDelete call openDeleteQuestionDialog QuestionIteractionService', () => {
        component.questions = [mockQuestion];
        dialogRefSpy.afterClosed.and.callFake(() => booleanSubject);
        component.questionInteractionService.invokeOnDeleteQuestion(mockQuestion);
        booleanSubject.next(true);
        expect(questionHttpServiceSpy.deleteQuestionById).toHaveBeenCalled();
        expect(component.questions).toEqual([]);
    });

    it('should invokeOnShare call shareQuestion QuestionIteractionService', () => {
        component.questions = [mockQuestion];
        component.questionInteractionService.invokeOnShareQuestion(mockQuestion);
        expect(questionSharingServiceSpy.share).toHaveBeenCalled();
    });
});
