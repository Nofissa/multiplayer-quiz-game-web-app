/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { quizStub } from '@app/TestStubs/quiz.stubs';
import { QuizDetailsDialogComponent } from '@app/components/dialogs/quiz-details-dialog/quiz-details-dialog.component';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { of } from 'rxjs';
import { SwiperModule } from 'swiper/angular';
import { CreateGamePageComponent } from './create-game-page.component';

describe('CreateGamePageComponent', () => {
    let component: CreateGamePageComponent;
    let fixture: ComponentFixture<CreateGamePageComponent>;
    let quizHttpServiceMock: jasmine.SpyObj<QuizHttpService>;
    let dialogMock: jasmine.SpyObj<MatDialog>;
    let snackBarMock: jasmine.SpyObj<MatSnackBar>;
    let routerMock: jasmine.SpyObj<Router>;
    let mockQuiz: Quiz;
    let dialogRefMock: jasmine.SpyObj<MatDialogRef<QuizDetailsDialogComponent>>;

    type DialogConfig = {
        quiz: Quiz;
        onStartGame: (quiz: Quiz) => void;
        onTestGame: (quiz: Quiz) => void;
        onNotFound: () => void;
    };

    const getDialogConfig = (): DialogConfig => dialogMock.open.calls.mostRecent()?.args[1]?.data as DialogConfig;

    beforeEach(async () => {
        quizHttpServiceMock = jasmine.createSpyObj('QuizHttpService', ['getVisibleQuizzes']);
        dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        mockQuiz = quizStub();
        quizHttpServiceMock.getVisibleQuizzes.and.returnValue(of([mockQuiz]));
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogMock.open.and.returnValue(dialogRefMock);

        await TestBed.configureTestingModule({
            declarations: [CreateGamePageComponent],
            imports: [SwiperModule],
            providers: [
                { provide: QuizHttpService, useValue: quizHttpServiceMock },
                { provide: MatDialog, useValue: dialogMock },
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should load quizzes on init', () => {
        component.ngOnInit();
        expect(quizHttpServiceMock.getVisibleQuizzes).toHaveBeenCalled();
        expect(component.quizzArray).toEqual([mockQuiz]);
    });

    it('should open quiz details dialog with correct data', () => {
        component.openQuizDetails(mockQuiz);
        expect(dialogMock.open).toHaveBeenCalledWith(QuizDetailsDialogComponent, {
            data: jasmine.any(Object),
        });
    });

    it('should navigate to waiting room page on startGame', () => {
        component['startGame'](mockQuiz);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/waiting-room'], { queryParams: { quizId: 'testId' } });
    });

    it('should navigate to game page in test mode on testGame', () => {
        component['testGame'](mockQuiz);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game'], { queryParams: { quizId: 'testId', isTest: true } });
    });

    it('should call openQuizDetails on swiper slide click', () => {
        spyOn(component, 'openQuizDetails');
        const compiled = fixture.debugElement.nativeElement;
        const firstSlide = compiled.querySelector('.game-slide');
        firstSlide.click();
        expect(component.openQuizDetails).toHaveBeenCalledWith(component.quizzArray[0]);
    });
    it('should display correct quiz information in each swiper slide', () => {
        const compiled = fixture.debugElement.nativeElement;
        const slides = compiled.querySelectorAll('.game-slide');
        slides.forEach((slide: HTMLElement, index: number) => {
            const quiz = component.quizzArray[index];
            const quizTitleElement = slide.querySelector('.quiz-title');
            const quizSubtitleElement = slide.querySelector('.quiz-subtitle');
            if (quizTitleElement && quizSubtitleElement) {
                expect(quizTitleElement.textContent).toContain(`Quiz ${index + 1}`);
                expect(quizSubtitleElement.textContent).toContain(quiz.title);
            } else {
                fail('Quiz title or subtitle element not found in the template');
            }
        });
    });

    it('should call startGame when onStartGame is executed', () => {
        spyOn<any>(component, 'startGame').and.callThrough();
        component.openQuizDetails(mockQuiz);

        const dialogConfig = getDialogConfig();
        dialogConfig.onStartGame(mockQuiz);

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect((component as any).startGame).toHaveBeenCalledWith(mockQuiz);
    });

    it('should call testGame when onTestGame is executed', () => {
        spyOn<any>(component, 'testGame').and.callThrough();
        component.openQuizDetails(mockQuiz);
        const dialogConfig = getDialogConfig();
        dialogConfig.onTestGame(mockQuiz);
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect((component as any).testGame).toHaveBeenCalledWith(mockQuiz);
    });
    it('should show snackbar and reload quizzes when onNotFound is executed', () => {
        spyOn(component, 'loadQuizzes').and.callThrough();
        component.openQuizDetails(mockQuiz);
        const dialogConfig = getDialogConfig();
        dialogConfig.onNotFound();
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(snackBarMock.open).toHaveBeenCalledWith("Le quiz n'est plus disponible", 'OK', jasmine.any(Object));
        expect(component.loadQuizzes).toHaveBeenCalled();
    });
});
