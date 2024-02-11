import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from './main-page.component';

describe('mainPage', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatDialogModule, MatSnackBarModule],
        }).compileComponents(); // compiles the modules (html + css)
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('Should create component', () => {
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

    it('Create button should redirect to creation view', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const buttons = compiled.querySelectorAll('button');
        const createButton = buttons[0];
        const spy = spyOn(router, 'navigateByUrl');
        createButton.click();
        const arg = spy.calls.argsFor(0)[0];
        const firstArgument = '/create-game';
        expect(arg.toString()).toEqual(firstArgument);
    });

    it('Admin button should redirect to admin view', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const buttons = compiled.querySelectorAll('button');
        const createButton = buttons[2];
        const spy = spyOn(router, 'navigateByUrl');
        createButton.click();
        const arg = spy.calls.argsFor(0)[0];
        const firstArgument = '/admin';
        expect(arg.toString()).toEqual(firstArgument);
    });

    it('should contain team logo', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const teamLogo = compiled.querySelector('img');
        expect(teamLogo).toBeTruthy();
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
});
