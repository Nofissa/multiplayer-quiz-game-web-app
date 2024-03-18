import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { HostGamePageComponent } from './host-game-page.component';
import SpyObj = jasmine.SpyObj;

fdescribe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;

    const gameService: SpyObj<GameService> = jasmine.createSpyObj<GameService>([
        'startGame',
        'toggleGameLock',
        'nextQuestion',
        'cancelGame',
        'endGame',
        'onCancelGame',
        'onToggleSelectChoice',
        'onToggleGameLock',
        'onSubmitChoices',
        'onStartGame',
        'onNextQuestion',
        'onPlayerAbandon',
    ]);

    const timerService: SpyObj<TimerService> = jasmine.createSpyObj<TimerService>(['onStartTimer', 'onTimerTick', 'startTimer', 'stopTimer']);

    const gameHttpService: SpyObj<GameHttpService> = jasmine.createSpyObj<GameHttpService>([]);

    const gameServicesProvider: GameServicesProvider = new GameServicesProvider(
        gameHttpService,
        gameService,
        timerService,
        new MessageService(),
        new PlayerService(),
        new KeyBindingService(),
    );

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent],
            providers: [MatSnackBar, GameHttpService, BarChartService, RoutingDependenciesProvider],
            imports: [RouterTestingModule, HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(HostGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
