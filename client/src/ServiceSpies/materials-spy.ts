import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import SpyObj = jasmine.SpyObj;
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '@app/interfaces/question';
import { Subject, of } from 'rxjs';

export class MaterialsSpy {
    mockQuestionSubject: Subject<Question>;
    mockBooleanSubject: Subject<boolean>;

    matDialogSpy: SpyObj<MatDialog>;

    matDialogRefQuestionSpy: SpyObj<MatDialogRef<Question>>;
    matDialogRefBooleanSpy: SpyObj<MatDialogRef<Question>>;

    matSnackBarSpy: SpyObj<MatSnackBar>;

    constructor() {
        this.mockQuestionSubject = new Subject();
        this.mockBooleanSubject = new Subject();

        this.matDialogRefQuestionSpy = jasmine.createSpyObj('MatDialogRef<Question>', ['afterClosed']);
        this.matDialogRefQuestionSpy.afterClosed.and.callFake(() => this.mockQuestionSubject);

        this.matDialogRefBooleanSpy = jasmine.createSpyObj('MatDialogRef<boolean>', ['afterClosed']);
        this.matDialogRefBooleanSpy.afterClosed.and.callFake(() => this.mockBooleanSubject);

        this.matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        this.matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        this.matSnackBarSpy.open.and.stub();
    }

    dialogReturnsBoolean() {
        this.matDialogSpy.open.and.callFake(() => this.matDialogRefBooleanSpy);
    }

    dialogReturnsQuestion() {
        this.matDialogSpy.open.and.callFake(() => this.matDialogRefQuestionSpy);
    }

    dialogRefReturnsQuestionObservable(question: Question) {
        this.matDialogRefQuestionSpy.afterClosed.and.callFake(() => of(question));
    }

    reset() {
        this.matDialogSpy.open.calls.reset();
        this.matSnackBarSpy.open.calls.reset();
    }
}
