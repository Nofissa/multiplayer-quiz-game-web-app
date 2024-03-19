import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { Subscription, throwError } from 'rxjs';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let spyRouter: jasmine.SpyObj<Router>;
    let spyGameHttpService: jasmine.SpyObj<GameHttpService>;
    let spyGameService: jasmine.SpyObj<GameService>;
    let spyPlayerService: jasmine.SpyObj<PlayerService>;
    let spySnackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        const activatedRouteSpy = {
            snapshot: {
                queryParams: { pin: '1234' },
            },
        };

        spyRouter = jasmine.createSpyObj<Router>('Router', ['navigateByUrl', 'navigate']);
        spyGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        spyGameService = jasmine.createSpyObj('GameService', ['onCancelGame', 'onPlayerBan', 'onPlayerAbandon', 'onStartGame', 'playerAbandon']);
        spyPlayerService = jasmine.createSpyObj('PlayerService', ['getCurrentPlayer']);
        spySnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            providers: [
                { provide: Router, useValue: spyRouter },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: GameHttpService, useValue: spyGameHttpService },
                { provide: GameService, useValue: spyGameService },
                { provide: PlayerService, useValue: spyPlayerService },
                { provide: MatSnackBar, useValue: spySnackBar },
                GameServicesProvider,
                RoutingDependenciesProvider,
            ],
            imports: [RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /home if gameHttpService throws 404 error', () => {
        const errorResponse = new HttpErrorResponse({ status: HttpStatusCode.NotFound });
        spyGameHttpService.getGameSnapshotByPin.and.returnValue(throwError(() => errorResponse));

        component.ngOnInit();

        expect(spyRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('leaveGame() should call playerAbandon() and navigate to /home', () => {
        const pin = '1234';
        component.pin = pin;

        component.leaveGame();

        expect(spyGameService.playerAbandon).toHaveBeenCalledWith(pin);
        expect(spyRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('handleEndGame() should navigate to results-page with pin as query parameter', () => {
        const pin = '1234';
        component.pin = pin;

        component.handleEndGame();

        expect(spyRouter.navigate).toHaveBeenCalledWith(['results-page'], { queryParams: { pin } });
    });

    it('should unsubscribe from all subscriptions on ngOnDestroy', () => {
        const mockSubscription1 = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);
        const mockSubscription2 = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);

        component['eventSubscriptions'] = [mockSubscription1, mockSubscription2];
        component.ngOnDestroy();

        expect(mockSubscription1.unsubscribe).toHaveBeenCalled();
        expect(mockSubscription2.unsubscribe).toHaveBeenCalled();
    });
});
