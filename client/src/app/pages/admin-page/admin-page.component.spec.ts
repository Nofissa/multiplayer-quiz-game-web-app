// necessary second class for mock
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { AuthService } from '@app/services/auth/auth.service';
import { SessionService } from '@app/services/session/session.service';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

class MockSessionService {
    getSession() {
        return 'mockToken';
    }
}

describe('adminPage', () => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    let verifySpy: jasmine.Spy;
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                SecurityServicesProvider,
                AuthService,
                { provide: SessionService, useClass: MockSessionService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        const authService = TestBed.inject(AuthService);
        verifySpy = spyOn(authService, 'verify');
        verifySpy.and.returnValue(of(undefined));
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        verifySpy.calls.reset();
        mockRouter.navigateByUrl.calls.reset();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should display the six names correctly', () => {
        const NUMBER_OF_TEAM_MEMBERS = 6;
        const spanElements = fixture.debugElement.queryAll(By.css('.footer-item p span'));
        const expectedNames = ['Loris Ponderand', 'Imed-Eddine Bennour', 'Nofissa Khaif', 'Romaine Brand', 'Dimitri Mansour', 'Jérémie Bolduc'];

        expect(spanElements.length).toEqual(NUMBER_OF_TEAM_MEMBERS);
        spanElements.forEach((span, index) => {
            expect(span.nativeElement.textContent.trim()).toEqual(expectedNames[index]);
        });
    });

    it('should contain team number', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const teamNumber = 'Équipe 206';
        const teamHtml = compiled.querySelector('h4');
        expect(teamHtml).toBeTruthy();
        expect(teamHtml?.textContent?.trim()).toEqual(teamNumber);
    });

    it('should display app-question-bank correctly', () => {
        const questionBankElement = fixture.debugElement.query(By.css('app-question-bank'));
        expect(questionBankElement).toBeTruthy();
    });

    it('should display app-quiz-list correctly', () => {
        const questionBankElement = fixture.debugElement.query(By.css('app-quiz-list'));
        expect(questionBankElement).toBeTruthy();
    });

    it('should display page title correctly', () => {
        const h1Element = fixture.debugElement.query(By.css('h1'));
        expect(h1Element).toBeTruthy();
        expect(h1Element.nativeElement.textContent).toEqual("Vue de création d'une partie");
    });

    it('should display mattab correctly', () => {
        const matTabElement = fixture.debugElement.query(By.css('mat-tab-group'));
        expect(matTabElement).toBeTruthy();
    });

    it('should return session service', () => {
        expect(component.getSession()).toBeInstanceOf(MockSessionService);
    });

    it('should redirect to home page when session is not present', () => {
        spyOn(component.getSession(), 'getSession').and.returnValue(null);
        component.ngOnInit();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should redirect to home page on verification error', () => {
        verifySpy.and.returnValue(throwError(() => new Error('Verification error')));
        component.ngOnInit();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should not redirect on successful verification', () => {
        verifySpy.and.returnValue(of(undefined));
        spyOn(component['sessionService'], 'getSession').and.returnValue('validToken');
        component.ngOnInit();
        expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
});
