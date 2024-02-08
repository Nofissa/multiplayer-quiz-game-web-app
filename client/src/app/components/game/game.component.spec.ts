/* eslint-disable max-lines */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDependenciesProviderService } from '@app/services/game-dependencies-provider.service';
import { GameComponent } from './game.component';

// class MockTimerService {
//     private stopTimer$ = new Subject<void>();

//     startTimer(duration: number, countdownCallback: (number: number) => void): Observable<number> {
//         let secondsLeft = duration;

//         const timer$ = of(...Array(duration + 1)).pipe(takeUntil(this.stopTimer$));

//         timer$.subscribe(() => {
//             countdownCallback(secondsLeft);
//             secondsLeft--;

//             if (secondsLeft < 0) {
//                 this.stopTimer();
//             }
//         });

//         return of(secondsLeft);
//     }

//     stopTimer(): void {
//         this.stopTimer$.next();
//         this.stopTimer$.complete();
//     }
// }

describe('gamePage', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    // let timerService: TimerService;
    // let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameComponent],
            imports: [RouterTestingModule],
            providers: [
                GameDependenciesProviderService,
                { provide: MatDialog, useValue: { open: jasmine.createSpy() } },
                { provide: Router, useValue: { navigateByUrl: jasmine.createSpy() } },
                // { provide: TimerService, useClass: MockTimerService },
            ],
        }).compileComponents();
    });

    describe('htmlTests', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(GameComponent);
            component = fixture.componentInstance;
            // router = TestBed.inject(Router);
            component.quiz.questions = [
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
            ];
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

        it('should contain logo during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const logo = fixture.debugElement.query(By.css('.logo'));
            expect(logo).toBeTruthy();
            const srcAttribute = logo.nativeElement.getAttribute('src');
            expect(srcAttribute).toBe('/assets/img/logo.png');
        });

        it('should display question correctly during the game', () => {
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const questionBox = fixture.debugElement.query(By.css('.question-box font-color'));
            const questionText = questionBox.query(By.css('#questionText')).nativeElement.textContent.trim();
            expect(questionBox).toBeTruthy();
            expect(questionText).toBe('Sample Question Text');
        });

        describe('answerBoxes', () => {
            const answerBox1 = fixture.debugElement.query(By.css('answer-box1'));
            const answerBox2 = fixture.debugElement.query(By.css('answer-box2'));
            const answerBox3 = fixture.debugElement.query(By.css('answer-box3'));
            const answerBox4 = fixture.debugElement.query(By.css('answer-box4'));
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
            const expectedValue = component.quiz.questions[component.currentQuestionIndex].points;
            const actualValue = value.nativeElement.textContent.trim();

            expect(value).toBeTruthy();
            expect(actualValue).toBe(`${expectedValue}`);
        });

        it('should display feedback when a question is validated', () => {
            component.validateChoices();
            fixture.detectChanges();
            const feedbackElement = fixture.debugElement.query(By.css('.feedback')).nativeElement;

            expect(feedbackElement.textContent.trim).toBe('Bonne réponse! :)' || 'Mauvaise réponse :(');
            expect(feedbackElement.classList.contains('correct-answer' || 'incorrect-answer')).toBe(true);
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
            expect(score.nativeElement.textContent.trim).toBe('Votre score: 147 points');
        });
    });

    describe('tsLogic', () => {
        // describe('timer', () => {
        //     beforeEach(() => {
        //         fixture = TestBed.createComponent(GameComponent);
        //         component = fixture.componentInstance;
        //         timerService = TestBed.inject(TimerService);
        //         fixture.detectChanges();
        //     });
        //     it('should start the timer and invoke callback on countdown', fakeAsync(() => {
        //         const countdownCallbackSpy = jasmine.createSpy('countdownCallback');
        //         spyOn(timerService, 'startTimer').and.callThrough();
        //         component.quiz.duration = 5;
        //         component.startTimer();
        //         const simulatedPassedTime = 3000;
        //         tick(simulatedPassedTime);
        //         expect(timerService.startTimer).toHaveBeenCalledWith(component.quiz.duration, jasmine.any(Function));
        //         expect(countdownCallbackSpy).toHaveBeenCalledWith(2);
        //         tick(simulatedPassedTime);
        //         expect(countdownCallbackSpy).toHaveBeenCalledWith(0);
        //         expect(timerService.stopTimer).toHaveBeenCalled();
        //     }));
        //     it('should stop the timer on stopTimer method call', () => {
        //         spyOn(timerService, 'stopTimer').and.callThrough();
        //         component.stopTimer();
        //         expect(timerService.stopTimer).toHaveBeenCalled();
        //     });
        //     afterEach(() => {
        //         fixture.destroy();
        //     });
        // });
        // let gameDependenciesProviderService: GameDependenciesProviderService;
        // let keyBindingService: KeyBindingService;
        // let dialog: MatDialog;
        // let router: Router;
        // it('keyboard shortcuts should be active if the focus is not on a textarea', fakeAsync(() => {
        //     fixture = TestBed.createComponent(GameComponent);
        //     component = fixture.componentInstance;
        //     gameDependenciesProviderService = TestBed.inject(GameDependenciesProviderService);
        //     keyBindingService = gameDependenciesProviderService.keyBindingService as KeyBindingService;
        //     dialog = TestBed.inject(MatDialog);
        //     router = TestBed.inject(Router);
        //     fixture.detectChanges();
        //     const mockEvent = new KeyboardEvent('keydown', { key: '1' });
        //     spyOn(document, 'activeElement').and.returnValue({ tagName: 'div' } as HTMLElement);
        //     component.handleKeyboardEvent(mockEvent);
        //     tick();
        //     // Assert your expected behavior, for example, check if the corresponding method is called
        //     // For the '1' key, you have registered a key binding to toggle choice selection
        //     expect(component.selectedChoices.length).toBe(1);
        // }));
    });
});
