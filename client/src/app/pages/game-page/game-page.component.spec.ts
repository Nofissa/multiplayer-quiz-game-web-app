import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from './game-page.component';

describe('gamePage', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    const mockActivatedRoute = {
        snapshot: {
            queryParams: {
                isTest: 'true',
            },
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
        }).compileComponents();
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

    it('should go in test mode when queryParams isTest is true', () => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component.loadMode();

        expect(component.isTest).toBe(true);
    });
});
