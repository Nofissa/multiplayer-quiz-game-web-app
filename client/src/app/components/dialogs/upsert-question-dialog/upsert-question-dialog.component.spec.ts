import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ID_LENGTH, MAX_CHOICE_COUNT, MIN_CHOICE_COUNT } from '@app/constants/constants';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { Choice } from '@common/choice';
import { QuestionType } from '@common/question-type';
import { UpsertQuestionDialogComponent } from './upsert-question-dialog.component';

describe('UpsertQuestionDialogComponent', () => {
    let component: UpsertQuestionDialogComponent;
    let fixture: ComponentFixture<UpsertQuestionDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let correctUpsertValues: UpsertQuestionDialogData;

    const noTrueChoiceValues: Choice[] = [
        {
            text: 'false choice 1',
            isCorrect: false,
        },
        {
            text: 'false choice 2',
            isCorrect: false,
        },
    ];
    const noFalseChoiceValues: Choice[] = [
        {
            text: 'true choice 1',
            isCorrect: true,
        },
        {
            text: 'true choice 2',
            isCorrect: true,
        },
    ];
    const noTextChoiceValues: Choice[] = [
        {
            text: '',
            isCorrect: true,
        },
        {
            text: '',
            isCorrect: false,
        },
    ];
    const wrongPoints = 11;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        correctUpsertValues = {
            title: 'some title',
            question: {
                type: QuestionType.QCM,
                text: 'some question ?',
                points: 10,
                choices: [
                    {
                        text: 'choice 1',
                        isCorrect: true,
                    },
                    {
                        text: 'choice 2',
                        isCorrect: false,
                    },
                ],
                lastModification: new Date(),
                _id: '',
            },
        };
        TestBed.configureTestingModule({
            declarations: [UpsertQuestionDialogComponent],
            imports: [ReactiveFormsModule, MatSnackBarModule, BrowserAnimationsModule, DragDropModule, MatRadioModule],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: correctUpsertValues,
                },
            ],
        });
        fixture = TestBed.createComponent(UpsertQuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should initialize the form with input data', () => {
        expect(component.formGroup.value).toEqual({
            text: correctUpsertValues.question.text,
            questionType: correctUpsertValues.question.type,
            choices: correctUpsertValues.question.choices,
            points: correctUpsertValues.question.points,
        });
    });

    it('should not display delete icon on question with only 2 choices', () => {
        const deleteIcons = fixture.debugElement.queryAll(By.css('.action-remove'));
        expect(deleteIcons.length).toBe(0);
    });

    it('should not be able to delete a choice when there are only 2', () => {
        component.removeAnswerAt(0);
        fixture.detectChanges();
        const choiceArray = component.choicesArray.length;
        expect(choiceArray).toBe(MIN_CHOICE_COUNT);
    });

    it('should ensure that the choicesArray contains all initially input choices', () => {
        const formGroupValue = correctUpsertValues.question.choices;
        const componentChoicesArray = component.formGroup.get('choices');

        expect(componentChoicesArray).toBeDefined();
        if (componentChoicesArray) {
            expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it('should not be able to add more than 2 choices', () => {
        component.addAnswer();
        component.addAnswer();
        component.addAnswer();
        fixture.detectChanges();
        const choiceArray = component.choicesArray.length;
        expect(choiceArray).toBe(MAX_CHOICE_COUNT);
    });

    it('should choicesArray contains all input choices when choice is added', () => {
        const formGroupValue: Choice[] = [];
        if (correctUpsertValues.question.choices) {
            correctUpsertValues.question.choices.forEach((choice) => {
                formGroupValue.push(choice);
            });
        }
        const newChoice: Choice = {
            text: '',
            isCorrect: false,
        } as unknown as Choice;

        formGroupValue.push(newChoice);
        component.addAnswer();
        const componentChoicesArray = component.formGroup.get('choices');

        expect(componentChoicesArray).not.toBeNull();
        if (componentChoicesArray) {
            expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it('should ensure choicesArray contains all input choices when last choice is removed', () => {
        const formGroupValue = correctUpsertValues.question.choices;
        component.addAnswer();
        component.removeAnswerAt(2);
        const componentChoicesArray = component.formGroup.get('choices');

        expect(componentChoicesArray).not.toBeNull();
        if (componentChoicesArray) {
            expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it('should ensure choicesArray contains all input choices when first choice is removed', () => {
        const formGroupValue: Choice[] = [];
        if (correctUpsertValues.question.choices) {
            correctUpsertValues.question.choices.forEach((choice) => {
                formGroupValue.push(choice);
            });
        }
        formGroupValue[0] = formGroupValue[1];
        formGroupValue[1] = {
            text: '',
            isCorrect: false,
        };
        component.addAnswer();
        component.removeAnswerAt(0);
        const componentChoicesArray = component.formGroup.get('choices');

        expect(componentChoicesArray).not.toBeNull();
        if (componentChoicesArray) {
            expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it('should change toggleQuestionType asign new question type value', () => {
        expect(component.qcm).toBeTruthy();
        component.toggleQuestionType(QuestionType.QCM);
        fixture.detectChanges();
        expect(component.qcm).toBeTruthy();
    });

    it('should close the dialog with formGroup value when submit is pressed and form is valid', () => {
        const newQuestion = Object.assign({}, correctUpsertValues.question);
        newQuestion.lastModification = new Date();
        component.formGroup.patchValue(newQuestion);
        component.submit();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should not close the dialog when there are only false choices', () => {
        component.formGroup.controls.choices.patchValue(noTrueChoiceValues);
        component.submit();
        expect(component.formGroup.controls.choices.valid).toBeFalsy();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when there are only true choices', () => {
        component.formGroup.controls.choices.patchValue(noFalseChoiceValues);
        component.submit();
        expect(component.formGroup.controls.choices.valid).toBeFalsy();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when choice text is empty', () => {
        component.formGroup.controls.choices.patchValue(noTextChoiceValues);
        component.submit();
        expect(component.formGroup.controls.choices.valid).toBeFalsy();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when the points value is not a multiple of ten', () => {
        component.formGroup.controls.points.patchValue(wrongPoints);
        component.submit();
        expect(component.formGroup.controls.points.valid).toBeFalsy();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when the question text is empty', () => {
        component.formGroup.controls.text.patchValue('');
        component.submit();
        expect(component.formGroup.controls.text.valid).toBeFalsy();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when submit is pressed and form is invalid', () => {
        component.formGroup.controls.text.patchValue(null);
        component.submit();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should submit Qrl question when submit is pressed and question is valid', () => {
        component.toggleQuestionType(QuestionType.QRL);
        component.submit();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should spring a snack bar when submit is pressed and form is invalid', () => {
        component.formGroup.controls.text.patchValue(null);
        component.submit();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should close the dialog when cancel is pressed', () => {
        component.cancel();
        expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });

    it('should drag and drop move items in array', () => {
        const initialChoices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        component.choicesArray.setValue(initialChoices);

        const cdkEvent: CdkDragDrop<unknown[]> = {
            container: {
                data: component.choicesArray.value,
            },
            previousIndex: 1,
            currentIndex: 0,
        } as unknown as CdkDragDrop<unknown[]>;

        component.drop(cdkEvent);

        expect(component.choicesArray.value).toEqual([
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 1', isCorrect: true },
        ]);
    });

    it('should generate a random string of default length', () => {
        const randomString = component['generateRandomString']();
        expect(randomString.length).toBe(ID_LENGTH);
    });

    it('should generate a random string of specified length', () => {
        const length = 10;
        const randomString = component['generateRandomString'](length);
        expect(randomString.length).toBe(length);
    });
});
