/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Quiz } from '@app/interfaces/quiz';
import { GameDependenciesProviderService } from '@app/services/game-dependencies-provider.service';
import { KeyBindingService } from '@app/services/key-binding.service';
import { TimerService } from '@app/services/timer-service';
import { GameComponent } from './game.component';

export const quizStub: Quiz = {
    id: 'test',
    title: 'testing',
    description: 'test quiz',
    duration: 20,
    lastModification: new Date(),
    questions: [
        {
            type: 'QCM',
            text: 'Sample Question Text',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            lastModification: null,
            _id: 'dheoh30hd380',
        },
    ],
    isHidden: null,
    _id: 'testsststst',
};

describe('gameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let keyBindingServiceSpy: jasmine.SpyObj<KeyBindingService>;
    let gameDependenciesProviderServiceSpy: jasmine.SpyObj<GameDependenciesProviderService>;
    // let router: Router;

    beforeEach(async () => {
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['startTimer', 'stopTimer']);
        keyBindingServiceSpy = jasmine.createSpyObj('KeyBindingService', ['registerKeyBinding', 'getExecutor']);
        gameDependenciesProviderServiceSpy = jasmine.createSpyObj('GameDependenciesProviderService', ['timerService', 'keyBindingService']);
        (gameDependenciesProviderServiceSpy as any).timerService = timerServiceSpy;
        (gameDependenciesProviderServiceSpy as any).keyBindingService = keyBindingServiceSpy;

        await TestBed.configureTestingModule({
            declarations: [GameComponent],
            imports: [RouterTestingModule],
            providers: [
                GameDependenciesProviderService,
                { provide: MatDialog, useValue: { open: jasmine.createSpy() } },
                { provide: Router, useValue: { navigateByUrl: jasmine.createSpy() } },
                { provide: GameDependenciesProviderService, useValue: gameDependenciesProviderServiceSpy },
            ],
        }).compileComponents();
    });

    describe('htmlTests', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(GameComponent);
            component = fixture.componentInstance;
            component.quiz = quizStub;
            fixture.detectChanges();
        });

        it('Should create component', () => {
            expect(component).toBeTruthy();
        });

        describe('validateButton', () => {
            it('should contain validate button during game', () => {
                component.secondsLeft = 40;
                component.currentQuestionIndex = 0;
                fixture.detectChanges();
                const validateButton = fixture.debugElement.query(By.css('#validateButton'));
                expect(validateButton).toBeTruthy();
                expect(validateButton.nativeElement.textContent?.trim()).toBe('Valider');
            });

            it('should call validateChoices() when validate button is clicked', () => {
                spyOn(component, 'validateChoices');
                const validateButton = fixture.debugElement.query(By.css('#validateButton'));
                validateButton.triggerEventHandler('click', null);
                fixture.detectChanges();

                expect(component.validateChoices).toHaveBeenCalled();
            });
        });

        describe('giveUpButton', () => {
            it('should contain give up button during the game', () => {
                component.secondsLeft = 40;
                component.currentQuestionIndex = 0;
                fixture.detectChanges();
                const abandonButton = fixture.debugElement.query(By.css('#giveUpButton'));
                expect(abandonButton).toBeTruthy();
                expect(abandonButton.nativeElement.textContent?.trim()).toBe('Abandonner');
            });

            it('should call openConfirmationDialog() when give up button is clicked', () => {
                spyOn(component, 'openConfirmationDialog');
                const giveUpButton = fixture.debugElement.query(By.css('#giveUpButton'));
                giveUpButton.nativeElement.click();

                expect(component.openConfirmationDialog).toHaveBeenCalled();
            });
        });

        it('should display question correctly during the game', () => {
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const questionBox = fixture.debugElement.query(By.css('.question-box'));
            const questionText = questionBox.query(By.css('#questionText')).nativeElement.textContent.trim();
            expect(questionBox).toBeTruthy();
            expect(questionText).toBe('Sample Question Text');
        });

        describe('answerBoxes', () => {
            const answerBox1 = fixture.debugElement.query(By.css('.answers-grid .answer-box1'));
            const answerBox2 = fixture.debugElement.query(By.css('.answers-grid .answer-box2'));
            const answerBox3 = fixture.debugElement.query(By.css('.answers-grid .answer-box3'));
            const answerBox4 = fixture.debugElement.query(By.css('.answers-grid .answer-box4'));
            beforeEach(() => {
                component.currentQuestionIndex = 0;
                fixture.detectChanges();
            });

            it('should contain the right amount of answer boxes correctly', () => {
                expect(answerBox1).toBeTruthy();
                expect(answerBox2).toBeTruthy();
                expect(answerBox3).toBeFalsy();
                expect(answerBox4).toBeFalsy();

                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
                fixture.detectChanges();
                expect(answerBox1).toBeTruthy();
                expect(answerBox2).toBeTruthy();
                expect(answerBox3).toBeTruthy();
                expect(answerBox4).toBeFalsy();

                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 4', isCorrect: true });
                fixture.detectChanges();
                expect(answerBox1).toBeTruthy();
                expect(answerBox1.nativeElement.textContent.trim()).toBe('Choice 1');
                expect(answerBox2).toBeTruthy();
                expect(answerBox2.nativeElement.textContent.trim()).toBe('Choice 2');
                expect(answerBox3).toBeTruthy();
                expect(answerBox3.nativeElement.textContent.trim()).toBe('Choice 3');
                expect(answerBox4).toBeTruthy();
                expect(answerBox4.nativeElement.textContent.trim()).toBe('Choice 4');
            });

            it('should call toggleChoiceSelection when a box is clicked', () => {
                spyOn(component, 'toggleChoiceSelection');
                answerBox1.nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();

                answerBox2.nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();

                answerBox3.nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();

                answerBox4.nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();
            });
        });

        it('should display question value correctly', () => {
            component.currentQuestionIndex = 0;
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
            component.quiz.questions[component.currentQuestionIndex].points = 20;
            fixture.detectChanges();
            const value = fixture.debugElement.query(By.css('#value'));
            const actualValue = value.nativeElement.textContent.trim();

            expect(value).toBeTruthy();
            expect(actualValue).toBe('20 points');
        });

        it('should display feedback when a question is validated', () => {
            component.validateChoices();
            fixture.detectChanges();
            const feedbackElement = fixture.debugElement.query(By.css('.feedback')).nativeElement;

            expect(feedbackElement.textContent.trim()).toBe('Mauvaise réponse :(' || 'Bonne réponse :)');
            expect(feedbackElement.classList.contains('correct-answer' || 'incorrect-answer'));
        });

        it('should display timer correctly', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const timer = fixture.debugElement.query(By.css('.timer'));
            expect(timer).toBeTruthy();
            expect(fixture.debugElement.query(By.css('#secondsLeft')).nativeElement.textContent).toBe('40 sec.');
        });

        it('should display score correctly', () => {
            component.currentQuestionIndex = 0;
            component.score = 147;
            fixture.detectChanges();
            const score = fixture.debugElement.query(By.css('#score'));
            expect(score).toBeTruthy();
            expect(score.nativeElement.textContent).toBe('Votre score: 147 points');
        });
    });

    // describe('tsLogic', () => {
    // });
});
