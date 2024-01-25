/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { QuestionComponent } from './question.component';
import { QuestionListModes } from '@app/enums/question-list-modes';
import { QuestionHttpService } from '@app/services/question-http.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Question } from '@app/interfaces/question';

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let mockUpsertQuestionDialog: jasmine.SpyObj<UpsertQuestionDialogComponent>;
    let mockQuestionHttpService: jasmine.SpyObj<QuestionHttpService>;
    let mockQuestionSharingService: jasmine.SpyObj<QuestionSharingService>;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockUpsertQuestionDialog = jasmine.createSpyObj('UpsertQuestionDialogComponent', ['submit', 'close']);
        mockQuestionHttpService = jasmine.createSpyObj('QuestionHttpService', ['updateQuestion', 'deleteQuestionById']);
        mockQuestionSharingService = jasmine.createSpyObj('QuestionSharingService', ['share']);

        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [
                { provide: MatDialog, useValue: mockDialog },
                { provide: QuestionHttpService, useValue: mockQuestionHttpService },
                { provide: QuestionSharingService, useValue: mockQuestionSharingService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = {
            _id: '1',
            question: 'Sample Question',
            incorrectAnswers: ['Incorrect Answer 1', 'Incorrect Answer 2', 'Incorrect Answer 3'],
            correctAnswer: 'Correct Answer',
            lastModified: new Date(),
        };
        component.mode = QuestionListModes.Sharing;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open edit dialog and call updateQuestion on submit', () => {
        const mockResult: Question = {
            _id: '1',
            question: 'Updated Question',
            incorrectAnswers: ['Updated Answer 1', 'Updated Answer 2', 'Updated Answer 3'],
            correctAnswer: 'Updated Correct Answer',
            lastModified: new Date(component.question.lastModified),
        };
        const question = structuredClone(component.question);
        question.lastModified = new Date(question.lastModified); // to convert the date

        mockDialog.open.and.returnValue({ afterClosed: () => of(mockResult) } as any);
        mockQuestionHttpService.updateQuestion.and.returnValue(of(mockResult));

        const editSpy = spyOn<any>(component, 'edit').and.callThrough();

        component.openEditQuestionDialog();
        expect(mockDialog.open).toHaveBeenCalledWith(UpsertQuestionDialogComponent, {
            width: '75%',
            data: { title: 'Modifier une question', question },
        });

        mockUpsertQuestionDialog.submit();

        expect(editSpy).toHaveBeenCalledWith({
            ...component.question,
            question: mockResult.question,
            incorrectAnswers: mockResult.incorrectAnswers,
            correctAnswer: mockResult.correctAnswer,
        });

        expect(mockQuestionHttpService.updateQuestion).toHaveBeenCalledWith({
            ...component.question,
            question: mockResult.question,
            incorrectAnswers: mockResult.incorrectAnswers,
            correctAnswer: mockResult.correctAnswer,
        });

        expect(mockQuestionSharingService.share).toHaveBeenCalled();
    });

    it('should open delete dialog and call delete on submit', () => {
        mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
        mockQuestionHttpService.deleteQuestionById.and.returnValue(of(component.question));

        const deleteSpy = spyOn<any>(component, 'delete').and.callThrough();

        component.openDeleteQuestionDialog();

        expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: '30%',
            data: { title: 'Supprimer la question', prompt: 'Êtes vous certains de vouloir supprimer la question?' },
        });

        expect(deleteSpy).toHaveBeenCalled();

        expect(mockQuestionHttpService.deleteQuestionById).toHaveBeenCalledWith(component.question._id);

        expect(component.isDeleted).toBe(true);
    });

    it('should call share on share()', () => {
        spyOn(component, 'share').and.callThrough();
        component.share();
        expect(mockQuestionSharingService.share).toHaveBeenCalledWith(component.question);
    });
});
