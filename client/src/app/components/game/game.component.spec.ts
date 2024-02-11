/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Quiz } from '@app/interfaces/quiz';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameService } from '@app/services/game-service';
import { KeyBindingService } from '@app/services/key-binding.service';
import { TimerService } from '@app/services/timer-service';
import { of } from 'rxjs';
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
    let gameServicesProviderSpy: jasmine.SpyObj<GameServicesProvider>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let router: Router;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['startTimer', 'stopTimer']);
        keyBindingServiceSpy = jasmine.createSpyObj('KeyBindingService', ['registerKeyBinding', 'getExecutor']);
        gameServicesProviderSpy = jasmine.createSpyObj('GameServicesProvider', ['timerService', 'keyBindingService']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['validateAnswers']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (gameServicesProviderSpy as any).timerService = timerServiceSpy;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (gameServicesProviderSpy as any).keyBindingService = keyBindingServiceSpy;

        await TestBed.configureTestingModule({
            declarations: [GameComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                GameServicesProvider,
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameServicesProvider, useValue: gameServicesProviderSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        timerServiceSpy = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;
        gameServicesProviderSpy = TestBed.inject(GameServicesProvider) as jasmine.SpyObj<GameServicesProvider>;
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
            beforeEach(() => {
                component.quiz = {
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
                component.currentQuestionIndex = 0;
                fixture.detectChanges();
            });

            it('should display two answer boxes for a question with two choices', () => {
                const answerBoxes = fixture.nativeElement.querySelectorAll('.answers-grid .answer-box');
                expect(answerBoxes.length).toBe(2);
            });

            it('should display three answer boxes for a question with three choices', () => {
                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
                fixture.detectChanges();
                const answerBoxes = fixture.nativeElement.querySelectorAll('.answers-grid .answer-box');
                expect(answerBoxes.length).toBe(3);
            });

            it('should display four answer boxes for a question with four choices', () => {
                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 4', isCorrect: true });
                const expectedLength = 4;
                fixture.detectChanges();
                const answerBoxes = fixture.nativeElement.querySelectorAll('.answers-grid .answer-box');
                expect(answerBoxes.length).toBe(expectedLength);
            });

            it('should call toggleChoiceSelection when a box is clicked', () => {
                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
                component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 4', isCorrect: true });
                fixture.detectChanges();
                spyOn(component, 'toggleChoiceSelection');
                fixture.debugElement.query(By.css('.answers-grid .answer-box1')).nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();

                fixture.debugElement.query(By.css('.answers-grid .answer-box2')).nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();

                fixture.debugElement.query(By.css('.answers-grid .answer-box3')).nativeElement.click();
                expect(component.toggleChoiceSelection).toHaveBeenCalled();

                fixture.debugElement.query(By.css('.answers-grid .answer-box4')).nativeElement.click();
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
            const questionValue = 40;
            component.allocatePoints(questionValue);
            fixture.detectChanges();
            let feedbackElement = fixture.debugElement.query(By.css('.feedback')).nativeElement;

            expect(feedbackElement.textContent.trim()).toBe('Bonne réponse! :) (+20%)');
            expect(feedbackElement.classList.contains('correct-answer'));
            component.allocatePoints(0);
            fixture.detectChanges();
            feedbackElement = fixture.debugElement.query(By.css('.feedback')).nativeElement;

            expect(feedbackElement.textContent.trim()).toBe('Mauvaise réponse :(');
            expect(feedbackElement.classList.contains('incorrect-answer'));
        });

        it('should display timer correctly', fakeAsync(() => {
            component.quiz.duration = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            component.startTimer();
            tick();
            const timer = fixture.debugElement.query(By.css('.timer'));
            expect(timer).toBeTruthy();
            const timerElement: HTMLElement = fixture.nativeElement.querySelector('.timer #secondsLeft');
            expect(timerElement.textContent).toContain(`${component.time} sec.`);
        }));

        it('should display score correctly', () => {
            component.currentQuestionIndex = 0;
            component.score = 147;
            fixture.detectChanges();
            const score = fixture.debugElement.query(By.css('#score'));
            expect(score).toBeTruthy();
            expect(score.nativeElement.textContent).toBe('Votre score: 147 points');
        });
    });

    describe('tsLogic', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(GameComponent);
            component = fixture.componentInstance;
            component.quiz = quizStub;
            fixture.detectChanges();
        });

        it('should navigate to correct route when the quiz is finished', fakeAsync(() => {
            component.isTest = true;
            component.currentQuestionIndex = component.quiz.questions.length - 1;
            const THREE_SECOND_IN_MS = 3000;

            component.nextQuestion();
            tick(THREE_SECOND_IN_MS);

            let redirect = '/create-game';
            expect(router.navigateByUrl).toHaveBeenCalledWith(redirect);

            component.isTest = false;
            component.currentQuestionIndex = component.quiz.questions.length - 1;

            component.nextQuestion();
            tick(THREE_SECOND_IN_MS);

            redirect = '/home';
            expect(router.navigateByUrl).toHaveBeenCalledWith(redirect);
        }));

        it('should call toggleChoiceSelection when a number key is pressed', fakeAsync(() => {
            component.ngOnChanges();
            spyOn(component, 'toggleChoiceSelection');
            expect(keyBindingServiceSpy.registerKeyBinding).toHaveBeenCalledWith('1', jasmine.any(Function));
            expect(keyBindingServiceSpy.registerKeyBinding).toHaveBeenCalledWith('2', jasmine.any(Function));
            expect(keyBindingServiceSpy.registerKeyBinding).toHaveBeenCalledWith('3', jasmine.any(Function));
            expect(keyBindingServiceSpy.registerKeyBinding).toHaveBeenCalledWith('4', jasmine.any(Function));

            keyBindingServiceSpy.registerKeyBinding.calls.argsFor(0)[1]();
            fixture.detectChanges();

            const expectedChoice = component.quiz.questions[component.currentQuestionIndex].choices[0];
            expect(component.toggleChoiceSelection).toHaveBeenCalledWith(expectedChoice);
        }));

        it('should call validateChoices when Enter key is pressed', fakeAsync(() => {
            component.ngOnChanges();
            spyOn(component, 'toggleChoiceSelection');
            expect(keyBindingServiceSpy.registerKeyBinding).toHaveBeenCalledWith('Enter', jasmine.any(Function));

            keyBindingServiceSpy.registerKeyBinding.calls.argsFor(0)[1]();
            fixture.detectChanges();

            const expectedChoice = component.quiz.questions[component.currentQuestionIndex].choices[0];
            expect(component.toggleChoiceSelection).toHaveBeenCalledWith(expectedChoice);
        }));

        it('should call executor when window keydown event is triggered', () => {
            const event = new KeyboardEvent('keydown', { key: 'A' });
            spyOn(event, 'preventDefault');

            // eslint-disable-next-line @typescript-eslint/no-empty-function
            keyBindingServiceSpy.getExecutor.and.returnValue(() => {});

            window.dispatchEvent(event);

            expect(keyBindingServiceSpy.getExecutor).toHaveBeenCalledWith('A');
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should not call executor when focused element is a textarea', () => {
            const event = new KeyboardEvent('keydown', { key: 'A' });

            const textarea: HTMLTextAreaElement = document.createElement('textarea');
            spyOnProperty(document, 'activeElement').and.returnValue(textarea);
            component.handleKeyboardEvent(event);

            expect(component.keyBindingService.getExecutor).not.toHaveBeenCalled();
        });

        it('should call validateChoices when the timer reaches 0', fakeAsync(() => {
            component.quiz.duration = 10;
            spyOn(component, 'validateChoices');

            // Start the timer and wait for it to initialize
            component.startTimer();
            tick();

            // Now, simulate the timer reaching 0
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            tick(10000);

            expect(component.time).toBe(0);
            expect(component.validateChoices).toHaveBeenCalled();
        }));

        it('should update secondsLeft correctly during the countdown', fakeAsync(() => {
            component.quiz.duration = 5;
            spyOn(component, 'validateChoices');

            component.startTimer();
            expect(component.time).toBe(3);

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            tick(1000);
            expect(component.secondsLeft).toBe(2);

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            tick(1000);
            expect(component.secondsLeft).toBe(1);

            expect(component.validateChoices).not.toHaveBeenCalled();
        }));

        it('isSelected() should return true if the choice is selected', () => {
            const choice = component.quiz.questions[component.currentQuestionIndex].choices[0];
            component.selectedChoices = [choice];
            const result = component.isSelected(choice);

            expect(result).toBe(true);
        });

        it('isSelected() should return false if the choice is not selected', () => {
            const choice = component.quiz.questions[component.currentQuestionIndex].choices[0];
            component.selectedChoices = [component.quiz.questions[component.currentQuestionIndex].choices[1]];
            const result = component.isSelected(choice);

            expect(result).toBe(false);
        });

        it('toggleChoiceSelection() should remove the choice if it is already selected', () => {
            const choice = component.quiz.questions[component.currentQuestionIndex].choices[0];
            component.selectedChoices = [choice];
            component.toggleChoiceSelection(choice);

            expect(component.selectedChoices).not.toContain(choice);
        });

        it('toggleChoiceSelection() should add the choice if it is not already selected', () => {
            const choice = component.quiz.questions[component.currentQuestionIndex].choices[0];
            expect(component.selectedChoices.length).toBe(0);
            component.toggleChoiceSelection(choice);

            expect(component.selectedChoices.length).toBe(1);
        });

        it('should allocate points for a correct answer', () => {
            component.score = 10;
            const addedPoints = 20;
            const initialScore = component.score;
            component.allocatePoints(addedPoints);

            expect(component.score).toBe(initialScore + addedPoints);
            expect(component.selectedChoices).toEqual([]);
        });

        it('should not allocate points for an incorrect answer', () => {
            component.score = 10;
            const initialScore = component.score;
            component.allocatePoints(0);

            expect(component.score).toBe(initialScore);
            expect(component.selectedChoices).toEqual([]);
        });

        it('should go to the next question for non-last questions', fakeAsync(() => {
            const threeSecondsMs = 3000;
            component.quiz.questions.push({
                type: 'QCM',
                text: 'Sample Question Text 2',
                points: 10,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                ],
                lastModification: null,
                _id: 'jedwi320nsxw',
            });
            component.currentQuestionIndex = 0;

            component.nextQuestion();
            tick(threeSecondsMs);
            fixture.detectChanges();

            expect(component.feedbackMessage).toBe('');
            expect(component.currentQuestionIndex).toBe(1);
            expect(component.questionValidated).toBe(false);
            expect(component.selectedChoices).toEqual([]);
        }));

        it('validateChoices() should validate answers, allocate points and call nextQuestion()', fakeAsync(() => {
            const mockResponse = { correctAnswers: [component.quiz.questions[component.currentQuestionIndex].choices[0]], score: 10 };
            gameServiceSpy.validateAnswers.and.returnValue(of(mockResponse));
            spyOn(component, 'nextQuestion');
            spyOn(component, 'allocatePoints');
            spyOn(timerServiceSpy, 'stopTimer');
            component.validateChoices();
            tick();

            expect(gameServicesProviderSpy.timerService.stopTimer).toHaveBeenCalled();
            expect(component.questionValidated).toBe(true);
            expect(gameServiceSpy.validateAnswers).toHaveBeenCalledWith(
                component.selectedChoices,
                // eslint-disable-next-line no-underscore-dangle
                component.quiz._id,
                component.currentQuestionIndex,
            );
            expect(component.allocatePoints).toHaveBeenCalledWith(mockResponse.score);
            expect(component.nextQuestion).toHaveBeenCalled();
        }));

        it('should open confirmation dialog and navigate on result true', () => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
            dialogRefSpyObj.afterClosed.and.returnValue(of(true));
            matDialogSpy.open.and.returnValue(dialogRefSpyObj as MatDialogRef<ConfirmationDialogComponent>);

            component.isTest = true;
            component.openConfirmationDialog();

            expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
                width: '300px',
                data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
            });
            expect(router.navigateByUrl).toHaveBeenCalledWith('/create-game');

            component.isTest = false;
            component.openConfirmationDialog();

            expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
                width: '300px',
                data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
            });

            expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
        });
    });
});
