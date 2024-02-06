import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpsertQuestionDialogComponent } from './upsert-question-dialog.component';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Choice } from '@app/interfaces/choice';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UpsertQuestionDialogComponent', () => {
    let component: UpsertQuestionDialogComponent;
    let fixture: ComponentFixture<UpsertQuestionDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
    const correctUpsertValues: UpsertQuestionDialogData = {
        title: 'some title',
        question: {
                    type: 'QCM',
                    text: 'some question ?',
                    points: 10,
                    choices: [
                        {
                            text: "choice 1",
                            isCorrect: true,
                        },
                        {
                            text: "choice 2",
                            isCorrect: false,
                        },
                        ],
                    lastModification: new Date(),
                    _id: '',
                },
    };

    beforeEach(() => {
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [UpsertQuestionDialogComponent],
            imports: [ReactiveFormsModule, MatSnackBarModule, BrowserAnimationsModule],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: correctUpsertValues,
                },
            ],
        });
        fixture = TestBed.createComponent(UpsertQuestionDialogComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
    });

    afterEach(()=> {
        fixture.destroy();
    });

    //FORM CREATION TESTING

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should initialize the form with inputted data', () => {
        expect(component.formGroup.value).toEqual(
            {
                text: correctUpsertValues.question.text,
                choices: correctUpsertValues.question.choices,
                points: correctUpsertValues.question.points,
            }
        );
    });

    it('should not display delete icon on question with only 2 choices', ()=> {
        const deleteIcons = fixture.debugElement.queryAll(By.css('.action-remove'));
        expect(deleteIcons.length).toBe(0);
    });

    it('should not be able to delete a choice when there are only 2', async ()=> {
        component.removeAnswerAt(0);
        await fixture.whenStable();
        fixture.detectChanges();
        let choiceArray = component.choicesArray.length;
        expect(choiceArray).toBe(2);
    });

    it('should choicesArray contain all initially inputted choices', () => {
        const formGroupValue = correctUpsertValues.question.choices;
        const componentChoicesArray = component.formGroup.get("choices");

        expect(componentChoicesArray).toBeDefined();
        if (componentChoicesArray) {
        expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it('should display delete icons on question with 3 choices', async ()=> {
        component.addAnswer();
        await fixture.whenRenderingDone();
        fixture.detectChanges();
        let deleteIcons = fixture.debugElement.queryAll(By.css('.action-remove'));
        expect(deleteIcons.length).toBe(3);
    });

    it('should display delete icons on question with 4 choices', async ()=> {
        component.addAnswer();
        component.addAnswer();
        await fixture.whenRenderingDone();
        fixture.detectChanges();
        let deleteIcons = fixture.debugElement.queryAll(By.css('.action-remove'));
        expect(deleteIcons.length).toBe(4);
    });

    it('should not be able to add more than 2 choices', async ()=> {
        component.addAnswer();
        component.addAnswer();
        component.addAnswer();
        await fixture.whenRenderingDone();
        fixture.detectChanges();
        let choiceArray = component.choicesArray.length;
        expect(choiceArray).toBe(4);
    });


    it ('should choicesArray contain all inputted choices when choice is added', ()=> {
        const formGroupValue = correctUpsertValues.question.choices;
        const newChoice: Choice = {
            text: '',
            isCorrect: false,
        } as unknown as Choice;

        formGroupValue.push(newChoice);
        component.addAnswer();
        const componentChoicesArray = component.formGroup.get("choices");

        expect(componentChoicesArray).not.toBeNull();
        if (componentChoicesArray) {
        expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it ('should choicesArray contain all inputted choices when last choice is removed', ()=> {
        const formGroupValue = correctUpsertValues.question.choices;
        component.addAnswer();
        component.removeAnswerAt(2);
        const componentChoicesArray = component.formGroup.get("choices");

        expect(componentChoicesArray).not.toBeNull();
        if (componentChoicesArray) {
        expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });


    it ('should choicesArray contain all inputted choices when first choice is removed', ()=> {
        const formGroupValue = correctUpsertValues.question.choices;
        formGroupValue[0] = formGroupValue[1];
        formGroupValue[1] = {
            text: '',
            isCorrect: false,
        }
        component.addAnswer();
        component.removeAnswerAt(0);
        const componentChoicesArray = component.formGroup.get("choices");

        expect(componentChoicesArray).not.toBeNull();
        if (componentChoicesArray) {
        expect(componentChoicesArray.value).toEqual(formGroupValue);
        }
    });

    it('should close the dialog with formGroup value when submit is pressed and form is valid', () => {
        const formGroupValue = {
                                    text: correctUpsertValues.question.text,
                                    choices: correctUpsertValues.question.choices,
                                    points: correctUpsertValues.question.points,
                                };
        component.formGroup.patchValue(formGroupValue);
        expect(component.formGroup.value).toEqual(formGroupValue);
        
        component.submit();

        expect(dialogRefSpy.close).toHaveBeenCalledWith(correctUpsertValues.question);
    });

    it('should not close the dialog when submit is pressed and form is invalid', () => {
        component.formGroup.setErrors({});

        component.submit();

        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close the dialog when cancel is pressed', () => {
        component.cancel();

        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

});
