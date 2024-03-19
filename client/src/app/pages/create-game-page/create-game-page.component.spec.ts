/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { quizStub } from '@app/TestStubs/quiz.stubs';
import { QuizDetailsDialogComponent } from '@app/components/dialogs/quiz-details-dialog/quiz-details-dialog.component';
import { Quiz } from '@app/interfaces/quiz';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameService } from '@app/services/game/game-service/game.service';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Observable, of } from 'rxjs';
import { io } from 'socket.io-client';
import { SwiperModule } from 'swiper/angular';
import { CreateGamePageComponent } from './create-game-page.component';

fdescribe('CreateGamePageComponent', () => {
    let component: CreateGamePageComponent;
    let fixture: ComponentFixture<CreateGamePageComponent>;
    let quizHttpServiceMock: jasmine.SpyObj<QuizHttpService>;
    let dialogMock: jasmine.SpyObj<MatDialog>;
    let snackBarMock: jasmine.SpyObj<MatSnackBar>;
    let routerMock: jasmine.SpyObj<Router>;
    let mockQuiz: Quiz;
    let dialogRefMock: jasmine.SpyObj<MatDialogRef<QuizDetailsDialogComponent>>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;

    type DialogConfig = {
        quiz: Quiz;
        onCreateGame: (quiz: Quiz) => void;
        onTestGame: (quiz: Quiz) => void;
        onNotFound: () => void;
    };

    const getDialogConfig = (): DialogConfig => dialogMock.open.calls.mostRecent()?.args[1]?.data as DialogConfig;

    beforeEach(async () => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on', 'getSocketId'], {
            socketInstance: io(),
        });

        quizHttpServiceMock = jasmine.createSpyObj('QuizHttpService', ['getVisibleQuizzes']);
        dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        mockQuiz = quizStub();
        quizHttpServiceMock.getVisibleQuizzes.and.returnValue(of([mockQuiz]));
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogMock.open.and.returnValue(dialogRefMock);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['onCreateGame', 'createGame', 'joinGame']);

        gameServiceSpy.onCreateGame.and.callFake((callback) => {
            return webSocketServiceSpy.on('createGame', callback);
        });

        await TestBed.configureTestingModule({
            declarations: [CreateGamePageComponent],
            imports: [SwiperModule],
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: QuizHttpService, useValue: quizHttpServiceMock },
                { provide: MatDialog, useValue: dialogMock },
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGamePageComponent);

        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;

        webSocketServiceSpy.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer) => {
                webSocketServiceSpy['socketInstance'].on(eventName, (data) => {
                    observer.next(data);
                });
                return () => {
                    webSocketServiceSpy['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });

        socketServerMock = new SocketServerMock([webSocketServiceSpy['socketInstance']]);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should load quizzes on init', () => {
        component.ngOnInit();
        expect(quizHttpServiceMock.getVisibleQuizzes).toHaveBeenCalled();
        expect(component.quizzArray).toEqual([mockQuiz]);
        expect(socketServerMock).toBeTruthy();
    });

    it('should open quiz details dialog with correct data', () => {
        component.openQuizDetails(mockQuiz);
        expect(dialogMock.open).toHaveBeenCalledWith(QuizDetailsDialogComponent, {
            data: jasmine.any(Object),
        });
    });

    it('should navigate to waiting room page on createGame', () => {
        component['createGame'](mockQuiz);
        socketServerMock.emit('createGame', '1234');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/host-game'], { queryParams: { pin: '1234' } });
    });

    it('should navigate to game page in test mode on testGame', () => {
        component['testGame'](mockQuiz);
        socketServerMock.emit('createGame', '1234');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game'], { queryParams: { pin: '1234', isTest: true } });
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

    it('should call creategame when onCreateGame is executed', () => {
        spyOn<any>(component, 'createGame').and.callThrough();
        component.openQuizDetails(mockQuiz);

        const dialogConfig = getDialogConfig();
        dialogConfig.onCreateGame(mockQuiz);

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(component['createGame']).toHaveBeenCalledWith(mockQuiz);
    });

    it('should call testGame when onTestGame is executed', () => {
        spyOn<any>(component, 'testGame').and.callThrough();
        component.openQuizDetails(mockQuiz);
        const dialogConfig = getDialogConfig();
        dialogConfig.onTestGame(mockQuiz);
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(component['testGame']).toHaveBeenCalledWith(mockQuiz);
    });
    it('should show snackbar and reload quizzes when onNotFound is executed', () => {
        spyOn(component, 'loadQuizzes').and.callThrough();
        component.openQuizDetails(mockQuiz);
        const dialogConfig = getDialogConfig();
        dialogConfig.onNotFound();
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(snackBarMock.open).toHaveBeenCalledWith("Le quiz n'est plus disponible, veuillez en sélectionner un autre", 'OK', jasmine.any(Object));
        expect(component.loadQuizzes).toHaveBeenCalled();
    });
});
