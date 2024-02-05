import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from './game-page.component';

describe('gamePage', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule],
        }).compileComponents(); // compiles the modules (html + css)
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        // router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('Should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should contain validate button during game', () => {
        component.displayQuestion = true;
        fixture.detectChanges();
        const validateButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Valider les choix"]'));
        expect(validateButton).toBeTruthy();
        expect(validateButton.nativeElement.textContent?.trim()).toBe('Valider les choix');
    });

    it('should not contain validate button in endgame', () => {
        component.displayQuestion = false;
        fixture.detectChanges();
        const validateButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Valider les choix"]'));
        expect(validateButton).toBeFalsy();
    });

    it('should contain give up button during the game', () => {
        component.displayQuestion = true;
        fixture.detectChanges();
        const abandonButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Abandonner"]'));
        expect(abandonButton).toBeTruthy();
        expect(abandonButton.nativeElement.textContent?.trim()).toBe('Abandonner');
    });

    it('should not contain give up button in endgame', () => {
        component.displayQuestion = false;
        fixture.detectChanges();
        const abandonButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Abandonner"]'));
        expect(abandonButton).toBeFalsy();
    });

    it('should contain quit button in endgame', () => {
        component.displayQuestion = false;
        fixture.detectChanges();
        const quitButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Quitter"]'));
        expect(quitButton).toBeTruthy();
        expect(quitButton.nativeElement.textContent?.trim()).toBe('Quitter');
    });
});
