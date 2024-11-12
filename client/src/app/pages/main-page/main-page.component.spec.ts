import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { SessionService } from '@app/services/session/session.service';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { of, Subscription, throwError } from 'rxjs';
import { MainPageComponent } from './main-page.component';

describe('MainPage', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialogServiceSpy: jasmine.SpyObj<MatDialog>;
    let snackBarServiceSpy: jasmine.SpyObj<MatSnackBar>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let sessionServiceSpy: jasmine.SpyObj<SessionService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
                { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
                { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
                { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['verify', 'login']) },
                { provide: SessionService, useValue: jasmine.createSpyObj('SessionService', ['getSession', 'setSession']) },
                { provide: GameService, useValue: jasmine.createSpyObj('GameService', ['joinGame', 'onJoinGame']) },
            ],
            imports: [HttpClientTestingModule],
        }).compileComponents();

        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        dialogServiceSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        snackBarServiceSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        routerSpy.navigate.calls.reset();
        dialogServiceSpy.open.calls.reset();
        snackBarServiceSpy.open.calls.reset();
        authServiceSpy.login.calls.reset();
        sessionServiceSpy.setSession.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain create button', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const buttons = compiled.querySelectorAll('button');
        expect(buttons[0]).toBeTruthy();
        expect(buttons[0].textContent?.trim()).toBe('Créer une partie');
    });

    it('should contain join button', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const buttons = compiled.querySelectorAll('button');
        expect(buttons[1]).toBeTruthy();
        expect(buttons[1].textContent?.trim()).toBe('Joindre une partie');
    });

    it('should contain admin button', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const buttons = compiled.querySelectorAll('button');
        expect(buttons[2]).toBeTruthy();
        expect(buttons[2].textContent?.trim()).toBe('Administrer les jeux');
    });

    it('should contain team number', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const teamNumber = 'Équipe 206';
        const teamHtml = compiled.querySelector('h4');
        expect(teamHtml).toBeTruthy();
        expect(teamHtml?.textContent?.trim()).toEqual(teamNumber);
    });

    it('should contain team members names', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const teammembersNames = 'Loris Ponderant, Imed-Eddine Bennour, Nofissa Khaif, Romaine Brand, Dimitri Mansour, Jérémie Bolduc';
        const teamHtml = compiled.querySelector('span');
        expect(teamHtml).toBeTruthy();
        expect(teamHtml?.textContent?.trim()).toEqual(teammembersNames);
    });

    describe('validateAdmin', () => {
        it('should navigate to admin page if token is valid', fakeAsync(() => {
            sessionServiceSpy.getSession.and.returnValue('validToken');
            authServiceSpy.verify.and.returnValue(of(undefined));

            component.validateAdmin();

            tick();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
        }));

        it('should prompt admin login if token is invalid or not present', fakeAsync(() => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ password: 'adminPassword' }) });

            sessionServiceSpy.getSession.and.returnValue(null);
            authServiceSpy.verify.and.returnValue(throwError(() => 'Invalid token'));
            authServiceSpy.login.and.returnValue(of({ token: 'some token' }));
            dialogServiceSpy.open.and.returnValue(dialogRefSpyObj);

            component.validateAdmin();

            tick();

            expect(dialogServiceSpy.open).toHaveBeenCalled();
        }));

        it('should call open prompt dialog upon error', fakeAsync(() => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ value: 'adminPassword' }) });
            sessionServiceSpy.getSession.and.returnValue('token');
            authServiceSpy.verify.and.returnValue(throwError(() => 'Error'));
            authServiceSpy.login.and.returnValue(throwError(() => 'Error'));
            dialogServiceSpy.open.and.returnValue(dialogRefSpyObj);

            component.validateAdmin();
            tick();

            expect(dialogServiceSpy.open).toHaveBeenCalled();
        }));
    });

    describe('promptAdminLogin', () => {
        it('should set session and navigate to admin page after successful login', fakeAsync(() => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ value: 'adminPassword' }) });

            authServiceSpy.login.and.returnValue(of({ token: 'validToken' }));
            dialogServiceSpy.open.and.returnValue(dialogRefSpyObj);

            component['promptAdminLogin']();

            tick();

            expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'Admin', password: 'adminPassword' });
            expect(sessionServiceSpy.setSession).toHaveBeenCalledWith('validToken');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
        }));

        it('should show snackbar on authentication failure', fakeAsync(() => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ value: 'invalidAdminPassword' }) });

            authServiceSpy.login.and.returnValue(throwError(() => 'Invalid credentials'));
            dialogServiceSpy.open.and.returnValue(dialogRefSpyObj);

            component['promptAdminLogin']();

            tick();

            expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'Admin', password: 'invalidAdminPassword' });
            expect(snackBarServiceSpy.open).toHaveBeenCalled();
        }));
    });

    describe('joinGame', () => {
        it('should join the game and navigate to the waiting room', fakeAsync(() => {
            const pin = '1234';
            const username = 'testUser';
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ pin, username }) });
            const fakeSubscription = new Subscription();

            dialogServiceSpy.open.and.returnValue(dialogRefSpyObj);
            gameServiceSpy.onJoinGame.and.callFake((_pinArg, callback) => {
                callback(firstPlayerStub());
                return fakeSubscription;
            });

            component.joinGame();

            tick();

            expect(dialogServiceSpy.open).toHaveBeenCalled();
            expect(gameServiceSpy.joinGame).toHaveBeenCalledWith(pin, username);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['waiting-room'], { queryParams: { pin } });
        }));
    });
});
