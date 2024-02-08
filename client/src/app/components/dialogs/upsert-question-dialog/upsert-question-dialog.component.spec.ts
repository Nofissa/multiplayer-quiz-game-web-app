import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpsertQuestionDialogComponent } from './upsert-question-dialog.component';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Choice } from '@app/interfaces/choice';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UpsertQuestionDialogComponent', () => {
    let component: UpsertQuestionDialogComponent;
    let fixture: ComponentFixture<UpsertQuestionDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    let correctUpsertValues: UpsertQuestionDialogData;

    const noTrueChoiceValues: Choice[] = [
                                            {
                                                text: 'false choice 1',
                                                isCorrect : false,
                                            },
                                            {
                                                text: 'false choice 2',
                                                isCorrect : false,
                                            }
                                        ];
    const noFalseChoiceValues: Choice[] = [
                                            {
                                                text: 'true choice 1',
                                                isCorrect : true,
                                            },
                                            {
                                                text: 'true choice 2',
                                                isCorrect : true,
                                            }
                                        ];

    const noTextChoiceValues: Choice[] = [
                                            {
                                                text: '',
                                                isCorrect : true,
                                            },
                                            {
                                                text: '',
                                                isCorrect : false,
                                            }
                                        ];
                                        


    beforeEach(() => {
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        const matSnackBarSpy= jasmine.createSpyObj ('MatSnackBar', ['open']);
        correctUpsertValues= {
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
        TestBed.configureTestingModule({
            declarations: [UpsertQuestionDialogComponent],
            imports: [ReactiveFormsModule, MatSnackBarModule, BrowserAnimationsModule],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                {provide: MatSnackBar, useValue: matSnackBarSpy}, 
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: correctUpsertValues,
                },
            ],
        });
        fixture = TestBed.createComponent(UpsertQuestionDialogComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
        snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        fixture.detectChanges();
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

    it('should not be able to delete a choice when there are only 2', ()=> {
        component.removeAnswerAt(0);
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

    it('should display delete icons on question with 3 choices', ()=> {
        component.addAnswer();
        fixture.detectChanges();
        let deleteIcons = fixture.debugElement.queryAll(By.css('.action-remove'));
        expect(deleteIcons.length).toBe(3)
        });

    it('should display delete icons on question with 4 choices', ()=> {
        component.addAnswer();
        component.addAnswer();
        fixture.detectChanges();
        let deleteIcons = fixture.debugElement.queryAll(By.css('.action-remove'));
        expect(deleteIcons.length).toBe(4);
    });

    it('should not be able to add more than 2 choices', ()=> {
        component.addAnswer();
        component.addAnswer();
        component.addAnswer();
        fixture.detectChanges();
        let choiceArray = component.choicesArray.length;
        expect(choiceArray).toBe(4);
    });


    it ('should choicesArray contain all inputted choices when choice is added', ()=> {
        const formGroupValue: Choice[] = [];
        correctUpsertValues.question.choices.forEach((choice)=> {
            formGroupValue.push(choice);
        });

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
        const formGroupValue: Choice[] = [];
        correctUpsertValues.question.choices.forEach((choice)=> {
            formGroupValue.push(choice);
        });

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

    it ('should toggle() change toogle status', ()=> {
        expect(component.qcmToggled).toBeFalsy();
        component.doToggle();
        fixture.detectChanges();
        expect(component.qcmToggled).toBeTruthy();
    });

    it ('should have answers in dialog when QCM is selected', ()=> {
        const answersArea = (fixture.debugElement.queryAll(By.css('.answers-wrapper'))).length;
        expect(answersArea).toBe(2);
    });

    it ('should not have answers in dialog when QRL is selected', ()=> {
        component.doToggle();
        fixture.detectChanges();
        const answersTextArea = (fixture.debugElement.queryAll(By.css('.answers-wrapper'))).length;
        expect(answersTextArea).toBe(0);
    });

    it('should close the dialog with formGroup value when submit is pressed and form is valid', () => {
        let newQuestion = Object.assign({}, correctUpsertValues.question);
        newQuestion.lastModification = new Date();
        component.submit();        
        expect(dialogRefSpy.close).toHaveBeenCalledWith(newQuestion);        
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
        component.formGroup.controls.points.patchValue(11);
        component.submit();        
        expect(component.formGroup.controls.points.valid).toBeFalsy();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();        
    });

    it('should not close the dialog when submit is pressed and form is invalid', () => {
        component.formGroup.setErrors({});
        component.submit();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

it('should not close the dialog when submit is pressed and qcm toggle is set for QRL', () => {
        component.doToggle();
        component.submit();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should spring a snack bar when submit is pressed and form is invalid', () => {
        component.formGroup.setErrors({});
        component.submit();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should close the dialog when cancel is pressed', () => {
        component.cancel();
        expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });

});
