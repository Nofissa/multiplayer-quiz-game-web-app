import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game-service/game.service';
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
});
