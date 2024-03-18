import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { firstPlayerStub } from '@app/TestStubs/player.stubs';
import { quizStub } from '@app/TestStubs/quiz.stubs';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { Subscription, of } from 'rxjs';
import { PlayerListComponent } from './player-list.component';

const gameSnapshotStub: GameSnapshot = {
    players: [],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Paused,
    currentQuestionIndex: 0,
    questionSubmissions: [],
};

const EVENT_LENGTH = 10;

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let gameHttpService: GameHttpService;
    let gameService: GameService;
    // let playerService: PlayerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [GameServicesProvider, PlayerService, MatSnackBar],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameHttpService = TestBed.inject(GameHttpService);
        gameService = TestBed.inject(GameService);
        // playerService = TestBed.inject(PlayerService);
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve players on initialization', () => {
        const dummyPin = '123';
        const dummySnapshot: GameSnapshot = gameSnapshotStub;
        spyOn(gameHttpService, 'getGameSnapshotByPin').and.returnValue(of(dummySnapshot));

        component.pin = dummyPin;
        component.ngOnInit();

        expect(gameHttpService.getGameSnapshotByPin).toHaveBeenCalledWith(dummyPin);
        expect(component.players).toEqual(dummySnapshot.players);
    });

    it('should add player on joining game', () => {
        const dummyPlayer: Player = firstPlayerStub();
        spyOn(gameService, 'onJoinGame').and.callFake(() => {
            component.players.push(dummyPlayer);
            return new Subscription();
        });

        component['setupSubscription']('123');
        expect(component.players.length).toEqual(1);
        expect(component.players[0]).toEqual(dummyPlayer);
    });

    it('should call banPlayer on ban', () => {
        // spyOn(playerService, 'isInGame').and.returnValue(true);
        const banPlayerSpy = spyOn(component, 'banPlayer');
        component['setupSubscription']('123');
        gameService.playerBan('123', 'test');
        component.banPlayer(firstPlayerStub());
        expect(banPlayerSpy).toHaveBeenCalled();
    });

    it('should handle banning a player', () => {
        const dummyPlayer: Player = firstPlayerStub();
        spyOn(gameService, 'onPlayerBan').and.callFake(() => {
            // component.players = component.players.filter((player) => player.username !== dummyPlayer.username);
            return new Subscription();
        });
        // spyOn(playerService, 'isInGame').and.returnValue(true);
        // const navigateByUrlSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

        component['setupSubscription']('123');
        component.banPlayer(dummyPlayer);

        // expect(navigateByUrlSpy).toHaveBeenCalledWith('/home');
        expect(component.players.length).toEqual(0);
    });

    it('shoud upsert a player', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.players = [dummyPlayer];
        component['upsertPlayer'](dummyPlayer);
        expect(component.players.length).toEqual(1);
        expect(component.players[0]).toEqual(dummyPlayer);
    });

    it('should sort players', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.players = [dummyPlayer, dummyPlayer];
        component['trySort']();
        expect(component.players.length).toEqual(2);
    });

    it('should sort players by score', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.players = [dummyPlayer, dummyPlayer];
        component.displayOptions.sorted = true;
        component['trySort']();
        expect(component.players.length).toEqual(2);
    });

    it('should sort players by username', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.players = [dummyPlayer, dummyPlayer];
        component.displayOptions.sorted = false;
        component['trySort']();
        expect(component.players.length).toEqual(2);
    });

    it('should handle setting up subscriptions', () => {
        const dummyPin = '123';
        spyOn(gameService, 'onSubmitChoices').and.returnValue(new Subscription());
        spyOn(gameService, 'onJoinGame').and.returnValue(new Subscription());
        spyOn(gameService, 'onPlayerBan').and.returnValue(new Subscription());
        spyOn(gameService, 'onPlayerAbandon').and.returnValue(new Subscription());
        spyOn(gameService, 'onStartGame').and.returnValue(new Subscription());
        component['setupSubscription'](dummyPin);
        expect(gameService.onSubmitChoices).toHaveBeenCalled();
        expect(gameService.onJoinGame).toHaveBeenCalled();
        expect(gameService.onPlayerBan).toHaveBeenCalled();
        expect(gameService.onPlayerAbandon).toHaveBeenCalled();
        expect(gameService.onStartGame).toHaveBeenCalled();
        expect(component['eventSubscriptions'].length).toEqual(EVENT_LENGTH);
    });

    it('should handle player abandonment', () => {
        spyOn(gameService, 'onPlayerAbandon').and.returnValue(new Subscription());
        // spyOn(playerService, 'isInGame').and.returnValue(true);

        component['setupSubscription']('123');
        gameService.playerAbandon('123');
        expect(component.players.length).toEqual(0);
    });
});
