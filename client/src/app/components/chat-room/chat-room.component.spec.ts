import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAX_MESSAGE_LENGTH } from '@app/constants/constants';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { Chatlog } from '@common/chatlog';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlSubmission } from '@common/qrl-submission';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';
import { ChatRoomComponent } from './chat-room.component';

describe('ChatRoomComponent', () => {
    let component: ChatRoomComponent;
    let fixture: ComponentFixture<ChatRoomComponent>;
    let mockGameHttpService: jasmine.SpyObj<GameHttpService>;
    let mockMessageService: jasmine.SpyObj<MessageService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockPlayerService: jasmine.SpyObj<PlayerService>;
    let mockSubscriptionService: jasmine.SpyObj<SubscriptionService>;

    const mockChatlogs: Chatlog[] = [
        {
            author: 'TestAuthor',
            message: 'Test message',
            date: new Date(),
        },
    ];

    const mockPlayers: Player[] = [
        {
            socketId: 'socket123',
            username: 'TestUser',
            state: PlayerState.Playing,
            score: 10,
            speedAwardCount: 1,
            hasInteracted: false,
            isTyping: false,
            hasSubmitted: false,
            isMuted: false,
        },
    ];

    const mockQuiz: Quiz = {
        id: 'quiz1',
        title: 'Test Quiz',
        description: 'A test quiz',
        duration: 30,
        lastModification: new Date(),
        questions: [],
        isHidden: false,
        _id: 'quiz1',
    };

    const mockState: GameState = GameState.Opened;

    const mockQuestionSubmissions: QcmSubmission[][] = [[{ clientId: 'Hello', choices: [{ payload: 0, isSelected: true }], isFinal: false }]];
    const mockQuestionQrlSubmissions: QrlSubmission[][] = [[{ answer: 'hello', clientId: 'playerId' }]];

    const mockGameSnapshot: GameSnapshot = {
        players: mockPlayers,
        chatlogs: mockChatlogs,
        quiz: mockQuiz,
        state: mockState,
        currentQuestionIndex: 0,
        questionQcmSubmissions: mockQuestionSubmissions,
        questionQrlSubmission: mockQuestionQrlSubmissions,
        questionQrlEvaluation: [],
    };

    beforeEach(() => {
        mockGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        mockMessageService = jasmine.createSpyObj('MessageService', ['onSendMessage']);
        mockGameService = jasmine.createSpyObj('GameService', ['onStartGame']);
        mockPlayerService = jasmine.createSpyObj('PlayerService', ['getCurrentPlayer', 'onPlayerMute', 'onPlayerBan', 'onPlayerAbandon']);
        mockSubscriptionService = jasmine.createSpyObj<SubscriptionService>(['add', 'clear']);

        TestBed.configureTestingModule({
            declarations: [ChatRoomComponent],
            providers: [
                { provide: GameHttpService, useValue: mockGameHttpService },
                { provide: MessageService, useValue: mockMessageService },
                { provide: GameService, useValue: mockGameService },
                { provide: PlayerService, useValue: mockPlayerService },
                { provide: SubscriptionService, useValue: mockSubscriptionService },
                FormBuilder,
                MatSnackBar,
            ],
            imports: [BrowserAnimationsModule],
        });
        fixture = TestBed.createComponent(ChatRoomComponent);
        component = fixture.componentInstance;
        component.pin = '1234';
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of(mockGameSnapshot));
        mockMessageService.sendMessage = jasmine.createSpy();
        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize and fetch initial chatlogs', () => {
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of(mockGameSnapshot));
        component.ngOnInit();
        expect(mockGameHttpService.getGameSnapshotByPin).toHaveBeenCalledWith('1234');
        expect(component.chatlogs).toEqual(mockGameSnapshot.chatlogs);
    });

    it('should send a message and clear input when valid', () => {
        component.input = 'Test message';
        component.sendMessage();
        expect(mockMessageService.sendMessage).toHaveBeenCalledWith('1234', 'Test message');
        expect(component.input).toBe('');
    });

    it('should not send a message if input is only whitespace', () => {
        component.input = '   ';
        component.sendMessage();
        expect(mockMessageService.sendMessage).not.toHaveBeenCalled();
    });

    it('should validate message as invalid if it contains only whitespace', () => {
        const messageControl = component.formGroup.get('message');
        if (messageControl) {
            messageControl.setValue('   ');
            messageControl.updateValueAndValidity();
            expect(messageControl.invalid).toBeTrue();
            expect(messageControl.errors).toEqual({ invalidMessage: true });
        } else {
            fail('Message control does not exist');
        }
    });

    it('should identify if the message author is the current user', () => {
        mockPlayerService.getCurrentPlayer.and.returnValue(mockPlayers[0]);
        expect(component.isCurrentUser('TestUser')).toBeTrue();
        expect(component.isCurrentUser('otherUser')).toBeFalse();
    });

    it('should call sendMessage on Enter key', () => {
        spyOn(component, 'sendMessage');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyDown(event);
        expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should update remaining input count on other keys', () => {
        component.input = 'Test';
        const event = new KeyboardEvent('keydown', { key: 'a' });
        component.handleKeyDown(event);
        expect(component.remainigInputCount).toBe(MAX_MESSAGE_LENGTH - component.input.length);
    });

    it('should update the remaining input count correctly', () => {
        component.input = 'Test';
        component.updateRemainingInputCount();
        expect(component.remainigInputCount).toBe(MAX_MESSAGE_LENGTH - component.input.length);
    });

    it('should add new chatlog message to chatlogs', () => {
        const testChatlog: Chatlog = { author: 'Test', message: 'New message', date: new Date() };
        component.ngOnInit();
        mockMessageService.onSendMessage.calls.mostRecent().args[1](testChatlog);
        expect(component.chatlogs).toContain(testChatlog);
    });

    it('should unsubscribe clear subscriptions on destroy', () => {
        component.ngOnDestroy();

        expect(mockSubscriptionService.clear).toHaveBeenCalledWith(component['uuid']);
    });

    it('should notify muted player', () => {
        spyOn(component['snackBarService'], 'open');
        mockPlayerService.getCurrentPlayer.and.returnValue(mockPlayers[0]);
        mockPlayerService.onPlayerMute.calls.mostRecent().args[1](mockPlayers[0]);
        expect(mockPlayerService.getCurrentPlayer).toHaveBeenCalled();
        expect(component['snackBarService'].open).toHaveBeenCalled();
    });

    it('should notify that a player has been banned', () => {
        const banchatlog: Chatlog = {
            author: 'Système',
            message: `${mockPlayers[0].username} a été banni`,
            date: new Date(),
        };
        mockPlayerService.onPlayerBan.calls.mostRecent().args[1](mockPlayers[0]);
        expect(component.chatlogs).toContain(banchatlog);
    });
    it('should notify that a player has abandonned', () => {
        const banchatlog: Chatlog = {
            author: 'Système',
            message: `${mockPlayers[0].username} a quitté la partie`,
            date: new Date(),
        };
        mockPlayerService.onPlayerAbandon.calls.mostRecent().args[1](mockPlayers[0]);
        expect(component.chatlogs).toContain(banchatlog);
    });
});
