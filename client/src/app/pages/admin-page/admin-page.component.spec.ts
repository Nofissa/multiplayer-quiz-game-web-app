/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { AuthService } from '@app/services/auth.service';
import { SessionService } from '@app/services/session.service';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

class MockSessionService {
    getSession() {
        return 'mockToken';
    }
}

class MockAuthService {
    verify() {
        return of();
    }
}

describe('adminPage', () => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                SecurityServicesProvider,
                { provide: AuthService, useClass: MockAuthService },
                { provide: SessionService, useClass: MockSessionService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should create component', () => {
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

    it('should redirect to home page when session is not present', () => {
        spyOn(component.sessionService, 'getSession').and.returnValue(null);
        component.ngOnInit();

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });
});
