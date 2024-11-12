import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Quiz } from '@common/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { saveAs } from 'file-saver';
import { of } from 'rxjs';
import { QuizComponent } from './quiz.component';

describe('QuizComponent', () => {
    let component: QuizComponent;
    let fixture: ComponentFixture<QuizComponent>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockQuizHttpService: jasmine.SpyObj<QuizHttpService>;
    let mockRouter: jasmine.SpyObj<Router>;

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

    beforeEach(() => {
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockQuizHttpService = jasmine.createSpyObj('QuizHttpService', ['deleteQuizById', 'hideQuizById']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [QuizComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: QuizHttpService, useValue: mockQuizHttpService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuizComponent);
        component = fixture.componentInstance;
        component.quiz = mockQuiz;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open delete quiz dialog', () => {
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown, unknown>);
        component.openDeleteQuizDialog();
        expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, jasmine.any(Object));
    });

    it('should not delete quiz when dialog is closed', () => {
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<unknown, unknown>);
        component.openDeleteQuizDialog();
        expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, jasmine.any(Object));
        expect(mockQuizHttpService.deleteQuizById).not.toHaveBeenCalled();
    });

    it('should delete quiz', () => {
        mockQuizHttpService.deleteQuizById.and.returnValue(of(undefined));
        const deleteEmitSpy = spyOn(component.delete, 'emit').and.stub();
        component.deleteQuiz();
        expect(deleteEmitSpy).toHaveBeenCalled();
    });

    it('should edit quiz', () => {
        component.editQuiz();
        // for mongodb id
        // eslint-disable-next-line no-underscore-dangle
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/qcm-creation'], { queryParams: { quizId: mockQuiz._id } });
    });

    it('should export quiz', () => {
        const saveAsSpy = spyOn(saveAs, 'saveAs').and.returnValue();
        component.exportQuiz();
        expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should toggle quiz visibility', () => {
        const updatedQuiz: Quiz = { ...mockQuiz, isHidden: true };
        mockQuizHttpService.hideQuizById.and.returnValue(of(updatedQuiz));

        component.onToggleChange();
        // for mongodb id
        // eslint-disable-next-line no-underscore-dangle
        expect(component.quiz).toEqual(updatedQuiz);
    });
});
