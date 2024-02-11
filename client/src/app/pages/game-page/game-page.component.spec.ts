import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
// import { QuizHttpService } from '@app/services/quiz-http.service';
import { GamePageComponent } from './game-page.component';

describe('gamePage', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        // const quizHttpServiceStub = jasmine.createSpyObj('QuizHttpService', ['getQuizById']);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            // providers: [{ provide: QuizHttpService, useValue: quizHttpServiceStub }],
        }).compileComponents();
        // quizHttpService = TestBed.inject(QuizHttpService) as jasmine.SpyObj<QuizHttpService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should contain game area', () => {
        fixture.detectChanges();
        const gameArea = fixture.debugElement.query(By.css('.game-area'));
        expect(gameArea).toBeTruthy();
    });

    it('should detect test mode', () => {
        component.isTest = true;
        fixture.detectChanges();
        expect(component.isTest).toBeTruthy();
        component.isTest = false;
        fixture.detectChanges();
        expect(component.isTest).toBeFalsy();
    });

    it('should contain chat box during the game', () => {
        const chatBox = fixture.debugElement.query(By.css('.chat-room'));
        expect(chatBox).toBeTruthy();
    });

    it('chat box should contain text area', () => {
        const textArea = fixture.debugElement.query(By.css('.write-message'));
        expect(textArea).toBeTruthy();
    });

    it('text area should contain correct placeholder', () => {
        const textArea = fixture.debugElement.query(By.css('.write-message'));
        const placeholderAttribute = textArea.nativeElement.getAttribute('placeholder');
        expect(placeholderAttribute).toBe('Envoyer un message');
    });

    it('should contain logo during the game', () => {
        fixture.detectChanges();
        const logo = fixture.debugElement.query(By.css('.logo'));
        expect(logo).toBeTruthy();
        const srcAttribute = logo.nativeElement.getAttribute('src');
        expect(srcAttribute).toBe('/assets/img/logo.png');
    });
});
