// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { UpsertQuestionDialogComponent } from './upsert-question-dialog.component';
// import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

// describe('UpsertQuestionDialogComponent', () => {
//     let component: UpsertQuestionDialogComponent;
//     let fixture: ComponentFixture<UpsertQuestionDialogComponent>;
//     let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;

//     beforeEach(() => {
//         const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

//         TestBed.configureTestingModule({
//             declarations: [UpsertQuestionDialogComponent],
//             imports: [ReactiveFormsModule],
//             providers: [
//                 FormBuilder,
//                 { provide: MatDialogRef, useValue: matDialogRefSpy },
//                 {
//                     provide: MAT_DIALOG_DATA,
//                     useValue: {
//                         title: 'some title',
//                         question: { question: '', incorrectAnswers: [], correctAnswer: '' },
//                     } as unknown as UpsertQuestionDialogData,
//                 },
//             ],
//         });

//         fixture = TestBed.createComponent(UpsertQuestionDialogComponent);
//         component = fixture.componentInstance;
//         dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<UpsertQuestionDialogComponent>>;
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should initialize the form with data', () => {
//         expect(component.formGroup.value).toEqual({
//             question: '',
//             incorrectAnswers: [],
//             correctAnswer: '',
//         });
//     });

//     it('should close the dialog when cancel is pressed', () => {
//         component.cancel();

//         expect(dialogRefSpy.close).toHaveBeenCalled();
//     });

//     it('should incorrectAnswersControls be equal to incorrectAnswersArray', () => {
//         const formGroupValue = {
//             question: 'Sample Question',
//             incorrectAnswers: ['Incorrect Answer 1', 'Incorrect Answer 2', 'Incorrect Answer 3'],
//             correctAnswer: 'Correct Answer',
//         };

//         component.formGroup.patchValue(formGroupValue);
//         expect(component.incorrectAnswersControls).toEqual(component.incorrectAnswersArray.controls as FormControl[]);
//     });

//     it('should close the dialog with formGroup value when submit is pressed and form is valid', () => {
//         const formGroupValue = {
//             question: 'Sample Question',
//             incorrectAnswers: ['Incorrect Answer 1', 'Incorrect Answer 2', 'Incorrect Answer 3'],
//             correctAnswer: 'Correct Answer',
//         };
//         component.formGroup.patchValue(formGroupValue);

//         component.submit();

//         expect(dialogRefSpy.close).toHaveBeenCalledWith(formGroupValue);
//     });

//     it('should not close the dialog when submit is pressed and form is invalid', () => {
//         component.formGroup.setErrors({});

//         component.submit();

//         expect(dialogRefSpy.close).not.toHaveBeenCalled();
//     });
// });
