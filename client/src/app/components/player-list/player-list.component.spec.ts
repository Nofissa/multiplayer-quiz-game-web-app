import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game-service/game.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
// import { Subscription } from 'rxjs';
import { PlayerListComponent } from './player-list.component';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    // let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GameService', ['onJoinGame', 'onPlayerBan', 'onPlayerAbandon', 'playerBan']);

        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [{ provide: GameService, useValue: spy }, HttpClient, HttpHandler, MatSnackBar],
        });

        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        // gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should handle dynamic players', () => {
    //     const fakePlayers = [
    //         { username: 'Player1', state: PlayerState.Banned, score: 15, speedAwardCount: 2 },
    //         { username: 'Player2', state: PlayerState.Playing, score: 10, speedAwardCount: 0 },
    //         { username: 'Player3', state: PlayerState.Playing, score: 25, speedAwardCount: 1 },
    //         { username: 'Player4', state: PlayerState.Playing, score: 0, speedAwardCount: 0 },
    //     ];

    //     component.isStatic = false;
    //     component.pin = 'fakePin';
    //     gameServiceSpy.onJoinGame.and.callFake((callback) => {
    //         callback({
    //             players: fakePlayers,
    //             pin: '',
    //             chatlogs: [],
    //         });
    //         return new Subscription();
    //     });
    //     component.ngOnInit();

    //     expect(component.players).toEqual(fakePlayers);
    // });

    it('should handle static players', () => {
        const fakeStaticPlayers = [
            { username: 'Player1', state: PlayerState.Banned, score: 15, speedAwardCount: 2 },
            { username: 'Player2', state: PlayerState.Playing, score: 10, speedAwardCount: 0 },
            { username: 'Player3', state: PlayerState.Playing, score: 25, speedAwardCount: 1 },
            { username: 'Player4', state: PlayerState.Playing, score: 0, speedAwardCount: 0 },
        ];

        component.isStatic = true;
        component.staticPlayers = fakeStaticPlayers;
        component.ngOnInit();

        const sortedStaticPlayers = fakeStaticPlayers.sort((a, b) => b.score - a.score);
        expect(component.players).toEqual(sortedStaticPlayers);
    });

    it('should ban a player', () => {
        const fakePlayer: Player = { username: 'Player1', state: PlayerState.Banned, score: 15, speedAwardCount: 2 };
        component.pin = 'fakePin';
        component.banPlayer(fakePlayer);
        expect(gameServiceSpy.playerBan).toHaveBeenCalledWith('fakePin', fakePlayer.username);
    });

    afterEach(() => {
        fixture.destroy();
    });
});
