import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { qrlQuestionStub } from '@app/test-stubs/question.stubs';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { PlayerState } from '@common/player-state';
import { QrlSubmission } from '@common/qrl-submission';
import { Observable, of } from 'rxjs';
import { io } from 'socket.io-client';
import { QrlListComponent } from './qrl-list.component';

const mockGameSnapshot: GameSnapshot = {
    players: [
        {
            socketId: '1234',
            username: 'Joe',
            state: PlayerState.Playing,
            score: 20,
            speedAwardCount: 12,
            hasInteracted: false,
            hasSubmitted: false,
            isTyping: false,
            isMuted: false,
        },
    ],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Opened,
    currentQuestionIndex: 0,
    questionQrlSubmission: [[{ answer: 'testinggg', clientId: 'ededwdwedw' }]],
    questionQcmSubmissions: [[{ clientId: 'Hello', choices: [{ payload: 1, isSelected: true }], isFinal: true }]],
    questionQrlEvaluation: [],
};

describe('QrlListComponent', () => {
    let component: QrlListComponent;
    let fixture: ComponentFixture<QrlListComponent>;
    let mockGameHttpService: jasmine.SpyObj<GameHttpService>;
    let socketServerMock: SocketServerMock;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        mockGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], { socketInstance: io() });
        mockGameService = jasmine.createSpyObj('GameService', ['onQrlSubmit', 'qrlEvaluate', 'onNextQuestion']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [QrlListComponent],
            providers: [
                { provide: GameHttpService, useValue: mockGameHttpService },
                MatDialog,
                MatSnackBar,
                { provide: GameService, useValue: mockGameService },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
            ],
        });
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
        mockGameService.onQrlSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qrlSubmit', applyIfPinMatches(pin, callback));
        });
        mockGameService.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });

        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of(mockGameSnapshot));
        socketServerMock = new SocketServerMock([webSocketServiceSpy['socketInstance']]);
        fixture = TestBed.createComponent(QrlListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should ngOnInit', () => {
        const dummyPin = '123';
        component.pin = dummyPin;
        spyOn(component, 'setupSubscriptions' as never);
        component.ngOnInit();
        expect(mockGameHttpService.getGameSnapshotByPin).toHaveBeenCalled();
        expect(component['setupSubscriptions']).toHaveBeenCalledWith(dummyPin);
    });

    it('should ngOnDestroy', () => {
        spyOn(component['subscriptionService'], 'clear');
        component.ngOnDestroy();
        expect(component['subscriptionService'].clear).toHaveBeenCalled();
    });

    it('should setupSubscription', () => {
        const qrlSubmission: GameEventPayload<QrlSubmission> = { pin: '123', data: { answer: 'tesstststs', clientId: firstPlayerStub().socketId } };
        component.pin = '123';
        component['players'] = [firstPlayerStub()];
        component['setupSubscriptions']('123');
        socketServerMock.emit('qrlSubmit', qrlSubmission);
        socketServerMock.emit('nextQuestion', qrlQuestionStub()[0]);
        expect(mockGameService.onQrlSubmit).toHaveBeenCalled();
        expect(mockGameService.onNextQuestion).toHaveBeenCalled();
    });

    it('should evaluateAnswers', () => {
        component.pin = '123';
        component.playersButtons = new Map();
        component.evaluationsDone = 0;
        component.evaluateAnswer(firstPlayerStub().socketId, 0);
        expect(mockGameService.qrlEvaluate).toHaveBeenCalledWith(firstPlayerStub().socketId, '123', 0);
        expect(component.playersButtons.size).toBe(1);
        expect(component.evaluationsDone).toBe(1);
    });

    it('should call slideNext() on swiperRef when evaluateAnswer() is called', () => {
        const swiperRefSpy = jasmine.createSpyObj('SwiperComponent', ['slideNext']);
        component.swiperRef = {
            swiperRef: swiperRefSpy,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        if (component.swiperRef.swiperRef) {
            component.evaluateAnswer('socketId', Grade.Good);
        }
        expect(component.swiperRef.swiperRef.slideNext).toHaveBeenCalled();
    });
});
