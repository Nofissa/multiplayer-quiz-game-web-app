import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { QCMCreationPageComponent } from './qcmcreation-page.component';
import { QuestionHttpService } from '@app/services/question-http.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('QCMCreationPageComponent', () => {
    let component: QCMCreationPageComponent;
    let fixture: ComponentFixture<QCMCreationPageComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    // let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        // const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const questionHttpClientSpy = jasmine.createSpyObj('QuestionHttpService', ['close']);
        const paramMap = jasmine.createSpyObj('ParamMap', ['get']);
        paramMap.get.and.returnValue('mockedQuizId'); // Set the value as needed
        const activatedRouteSpy = {
            queryParamMap: of(paramMap),
        };
        const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            declarations: [QCMCreationPageComponent],
            providers: [
                // { provide: MatDialog, useValue: matDialogSpy },
                { provide: QuestionHttpService, useValue: questionHttpClientSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: MatSnackBar, useValue: matSnackBarSpy },
            ],
            imports: [HttpClientModule, MatSnackBarModule],
        });

        // dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        fixture = TestBed.createComponent(QCMCreationPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    });

    // it('should addQuestion open the upset question dialog', ()=> {
    //     dialogSpy.open.and.callFake(() => {
    //         return {
    //             type: 'QCM',
    //             text: 'some question',
    //             choices: [
    //                 {
    //                     text: 'some choice',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'some choice',
    //                     isCorrect: false,
    //                 },
    //             ],
    //             lastModification: new Date(),
    //             points: 10,
    //             _id: 'someID',

    //         }
    //     });
    //     component.addQuestion();
    //     expect(dialogSpy.open).toHaveBeenCalled();

    // });
});
