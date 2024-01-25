/* eslint-disable deprecation/deprecation */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { QuestionListComponent } from './question-list.component';
import { QuestionHttpService } from '@app/services/question-http.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-upsert-question-dialog',
    template: '',
})
class MockUpsertQuestionDialogComponent {
    @Input() data: UpsertQuestionDialogData;
}

describe('QuestionListComponent', () => {
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let questionHttpServiceSpy: jasmine.SpyObj<QuestionHttpService>;
    let questionSharingServiceSpy: jasmine.SpyObj<QuestionSharingService>;
    let dialogServiceSpy: jasmine.SpyObj<MatDialog>;
    let consoleSpy: jasmine.SpyObj<Console>;

    const sampleQuestion: Question = {
        _id: '1',
        question: 'Sample Question',
        incorrectAnswers: ['Incorrect Answer 1', 'Incorrect Answer 2', 'Incorrect Answer 3'],
        correctAnswer: 'Correct Answer',
        lastModified: new Date(),
    };

    beforeEach(() => {
        questionHttpServiceSpy = jasmine.createSpyObj('QuestionHttpService', ['getAllQuestions', 'createQuestion']);
        questionSharingServiceSpy = jasmine.createSpyObj('QuestionSharingService', ['listen']);
        dialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open']);
        consoleSpy = jasmine.createSpyObj('console', ['error']);

        TestBed.configureTestingModule({
            declarations: [QuestionListComponent, MockUpsertQuestionDialogComponent],
            providers: [
                { provide: QuestionHttpService, useValue: questionHttpServiceSpy },
                { provide: QuestionSharingService, useValue: questionSharingServiceSpy },
                { provide: MatDialog, useValue: dialogServiceSpy },
            ],
            imports: [BrowserAnimationsModule],
            schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements
        });

        fixture = TestBed.createComponent(QuestionListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch questions on initialization', fakeAsync(() => {
        const mockQuestions: Question[] = [sampleQuestion];
        questionHttpServiceSpy.getAllQuestions.and.returnValue(of(mockQuestions));

        fixture.detectChanges();
        tick();

        expect(component.questions).toEqual(mockQuestions);
    }));

    it('should handle error when fetching questions', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
        questionHttpServiceSpy.getAllQuestions.and.returnValue(throwError(errorResponse));

        component.ngOnInit();

        fixture.detectChanges();
        tick();

        expect(consoleSpy.error).toHaveBeenCalledWith(errorResponse);
    }));
});
