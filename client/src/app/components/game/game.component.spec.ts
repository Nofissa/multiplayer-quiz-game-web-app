/* eslint-disable max-lines */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GameComponent } from './game.component';

describe('gamePage', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    // let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameComponent],
            imports: [RouterTestingModule],
        }).compileComponents();
    });

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
            const validateButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Valider les choix"]'));
            expect(validateButton).toBeTruthy();
            expect(validateButton.nativeElement.textContent?.trim()).toBe('Valider les choix');
        });

        it('should not contain validate button in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const validateButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Valider les choix"]'));
            expect(validateButton).toBeFalsy();
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
            const abandonButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Abandonner"]'));
            expect(abandonButton).toBeTruthy();
            expect(abandonButton.nativeElement.textContent?.trim()).toBe('Abandonner');
        });

        it('should not contain give up button in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const abandonButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Abandonner"]'));
            expect(abandonButton).toBeFalsy();
        });

        it('should call openConfirmationDialog() when give up button is clicked', () => {
            spyOn(component, 'openConfirmationDialog');
            const giveUpButton = fixture.debugElement.query(By.css('.ff-circle button'));
            giveUpButton.nativeElement.click();

            expect(component.openConfirmationDialog).toHaveBeenCalled();
        });
    });

    describe('quitButton', () => {
        it('should contain quit button in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const quitButton = fixture.debugElement.query(By.css('.button[ng-reflect-message="Quitter"]'));
            expect(quitButton).toBeTruthy();
            expect(quitButton.nativeElement.textContent?.trim()).toBe('Quitter');
        });

        it('should call openConfirmationDialog() when quit button is clicked', () => {
            spyOn(component, 'openConfirmationDialog');
            const quitButton = fixture.debugElement.query(By.css('.centered-text #quitEndGame'));
            quitButton.nativeElement.click();

            expect(component.openConfirmationDialog).toHaveBeenCalled();
        });
    });

    describe('logo', () => {
        it('should contain logo during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const logo = fixture.debugElement.query(By.css('.logo'));
            expect(logo).toBeTruthy();
            const srcAttribute = logo.nativeElement.getAttribute('src');
            expect(srcAttribute).toBe('/assets/img/logo.png');
        });

        it('should not contain logo during endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const logo = fixture.debugElement.query(By.css('.logo'));
            expect(logo).toBeFalsy();
        });
    });

    describe('questionBox', () => {
        it('should contain question box during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const questionBox = fixture.debugElement.query(By.css('.question-box font-color'));
            expect(questionBox).toBeTruthy();
        });

        it('should not contain question box in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const questionBox = fixture.debugElement.query(By.css('.question-box font-color'));
            expect(questionBox).toBeFalsy();
        });

        it('should display question in its box during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();

            const questionBoxElement = fixture.debugElement.query(By.css('.question-box'));
            const questionText = questionBoxElement.nativeElement.textContent.trim();
            expect(questionText).toBeTruthy();
            expect(questionText).toBe('Sample Question Text');
        });
    });

    describe('answerBoxes', () => {
        beforeEach(() => {
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
        });

        it('should contain two answer boxes if two choices during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();

            const answerBox1 = fixture.debugElement.query(By.css('.answer-box1'));
            expect(answerBox1).toBeTruthy();

            const answerBox2 = fixture.debugElement.query(By.css('.answer-box2'));
            expect(answerBox2).toBeTruthy();

            const answerBox3 = fixture.debugElement.query(By.css('.answer-box3'));
            expect(answerBox3).toBeFalsy();

            const answerBox4 = fixture.debugElement.query(By.css('.answer-box4'));
            expect(answerBox4).toBeFalsy();
        });

        it('should contain three answer boxes if three choices during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
            fixture.detectChanges();

            const answerBox1 = fixture.debugElement.query(By.css('.answer-box1'));
            expect(answerBox1).toBeTruthy();

            const answerBox2 = fixture.debugElement.query(By.css('.answer-box2'));
            expect(answerBox2).toBeTruthy();

            const answerBox3 = fixture.debugElement.query(By.css('.answer-box3'));
            expect(answerBox3).toBeTruthy();

            const answerBox4 = fixture.debugElement.query(By.css('.answer-box4'));
            expect(answerBox4).toBeFalsy();
        });

        it('should contain four answer boxes if four choices during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 4', isCorrect: true });
            fixture.detectChanges();

            const answerBox1 = fixture.debugElement.query(By.css('.answer-box1'));
            expect(answerBox1).toBeTruthy();

            const answerBox2 = fixture.debugElement.query(By.css('.answer-box2'));
            expect(answerBox2).toBeTruthy();

            const answerBox3 = fixture.debugElement.query(By.css('.answer-box3'));
            expect(answerBox3).toBeTruthy();

            const answerBox4 = fixture.debugElement.query(By.css('.answer-box4'));
            expect(answerBox4).toBeTruthy();
        });

        it('should display answers in their boxes during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 4', isCorrect: true });
            fixture.detectChanges();

            const answerBox1 = fixture.debugElement.query(By.css('.answer-box1'));
            const answerBox1Text = answerBox1.nativeElement.textContent.trim();
            expect(answerBox1Text).toBeTruthy();
            expect(answerBox1Text).toBe('Choice 1');

            const answerBox2 = fixture.debugElement.query(By.css('.answer-box2'));
            const answerBox2Text = answerBox2.nativeElement.textContent.trim();
            expect(answerBox2Text).toBeTruthy();
            expect(answerBox2Text).toBe('Choice 2');

            const answerBox3 = fixture.debugElement.query(By.css('.answer-box3'));
            const answerBox3Text = answerBox3.nativeElement.textContent.trim();
            expect(answerBox3Text).toBeTruthy();
            expect(answerBox3Text).toBe('Choice 3');

            const answerBox4 = fixture.debugElement.query(By.css('.answer-box4'));
            const answerBox4Text = answerBox4.nativeElement.textContent.trim();
            expect(answerBox4Text).toBeTruthy();
            expect(answerBox4Text).toBe('Choice 4');
        });

        // it('should toggle the first answer box when clicked', () => {
        //     const answerBoxElement = fixture.debugElement.query(By.css('.answer-box1'));
        //     const initialSelectedState = component.isSelected(component.quiz.questions[component.currentQuestionIndex].choices[0]);
        //     answerBoxElement.triggerEventHandler('click', null);
        //     fixture.detectChanges();

        //     const finalSelectedState = component.isSelected(component.quiz.questions[component.currentQuestionIndex].choices[0]);
        //     expect(initialSelectedState).toBe(!finalSelectedState);
        // });

        // it('should toggle the second answer box when clicked', () => {
        //     const answerBoxElement = fixture.debugElement.query(By.css('.answer-box2'));
        //     const initialSelectedState = component.isSelected(component.quiz.questions[component.currentQuestionIndex].choices[0]);
        //     answerBoxElement.triggerEventHandler('click', null);
        //     fixture.detectChanges();

        //     const finalSelectedState = component.isSelected(component.quiz.questions[component.currentQuestionIndex].choices[0]);
        //     expect(initialSelectedState).toBe(!finalSelectedState);
        // });

        // it('should toggle the third answer box when clicked', () => {
        //     const answerBoxElement = fixture.debugElement.query(By.css('.answer-box3'));
        //     const initialSelectedState = component.isSelected(1);
        //     answerBoxElement.triggerEventHandler('click', null);
        //     fixture.detectChanges();

        //     const finalSelectedState = component.isSelected(1);
        //     expect(initialSelectedState).toBe(!finalSelectedState);
        // });

        // it('should toggle the fourth answer box when clicked', () => {
        //     const answerBoxElement = fixture.debugElement.query(By.css('.answer-box4'));
        //     const initialSelectedState = component.isSelected(1);
        //     answerBoxElement.triggerEventHandler('click', null);
        //     fixture.detectChanges();

        //     const finalSelectedState = component.isSelected(1);
        //     expect(initialSelectedState).toBe(!finalSelectedState);
        // });
    });

    describe('questioValue', () => {
        it('should contain question value during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const value = fixture.debugElement.query(By.css('.value-circle font-color'));
            expect(value).toBeTruthy();
        });

        it('should not contain question value in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const value = fixture.debugElement.query(By.css('.value-circle font-color'));
            expect(value).toBeFalsy();
        });

        it('should display right question value during the game', () => {
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 3', isCorrect: false });
            component.quiz.questions[component.currentQuestionIndex].choices.push({ text: 'Choice 4', isCorrect: true });
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const valueCircleElement = fixture.debugElement.query(By.css('.value-circle font-color'));
            const expectedValue = component.quiz.questions[component.currentQuestionIndex].points;

            const actualValue = valueCircleElement.query(By.css('.centered-text')).nativeElement.textContent.trim();
            expect(actualValue).toBe(`${expectedValue}`);
        });
    });

    describe('feedback', () => {
        it('should display feedback when a question is validated', () => {
            component.validateChoices();
            fixture.detectChanges();
            const feedbackElement = fixture.debugElement.query(By.css('.feedback')).nativeElement;

            expect(feedbackElement.textContent).toContain('Bonne réponse! :)' || 'Mauvaise réponse :(');
            expect(feedbackElement.classList.contains('correct-answer' || 'incorrect-answer')).toBe(true);
        });
    });

    // describe('chatBox', () => {
    //     it('should contain chat box during the game', () => {
    //         component.displayQuestion = true;
    //         fixture.detectChanges();
    //         const chatBox = fixture.debugElement.query(By.css('.chat-box'));
    //         expect(chatBox).toBeTruthy();
    //     });

    //     it('should not contain chat box in endgame', () => {
    //         component.displayQuestion = false;
    //         fixture.detectChanges();
    //         const chatBox = fixture.debugElement.query(By.css('.chat-box'));
    //         expect(chatBox).toBeFalsy();
    //     });

    //     it('chat box should contain text area', () => {
    //         component.displayQuestion = true;
    //         fixture.detectChanges();
    //         const chatBox = fixture.debugElement.query(By.css('.chat-box'));
    //         const textArea = chatBox.query(By.css('.write-message'));
    //         expect(textArea).toBeTruthy();
    //     });
    // });

    describe('timer', () => {
        it('should contain timer during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const timer = fixture.debugElement.query(By.css('.timer-circle'));
            expect(timer).toBeTruthy();
        });

        it('should not contain timer in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const timer = fixture.debugElement.query(By.css('.timer-circle'));
            expect(timer).toBeFalsy();
        });

        it('should display correct amount of seconds left', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();

            const secondsLeft = fixture.debugElement.query(By.css('.timer-circle .centered-text'));
            expect(secondsLeft.nativeElement.textContent).toContain('Il reste 40 seconde(s)');
        });
    });

    describe('score', () => {
        it('should contain score during the game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();
            const score = fixture.debugElement.query(By.css('.score-circle font-color'));
            expect(score).toBeTruthy();
        });

        it('should not contain score in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            fixture.detectChanges();
            const score = fixture.debugElement.query(By.css('.score-circle font-color'));
            expect(score).toBeFalsy();
        });

        it('should display correct score', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            component.score = 147;
            fixture.detectChanges();

            const score = fixture.debugElement.query(By.css('.score-circle font-color .centered-text'));
            expect(score.nativeElement.textContent).toContain('147 points');
        });
    });

    describe('endgameMessage', () => {
        it('should display correct message in endgame', () => {
            component.secondsLeft = 0;
            component.currentQuestionIndex = 4;
            component.score = 286;
            fixture.detectChanges();

            const endGameMessage = fixture.debugElement.query(By.css('.end-game-container'));
            expect(endGameMessage.nativeElement.textContent).toContain('LE QUIZ EST TERMINÉ. VOUS AVEZ OBTENU 286 POINTS');
        });

        it('should not display endgame message during game', () => {
            component.secondsLeft = 40;
            component.currentQuestionIndex = 0;
            fixture.detectChanges();

            const endGameMessage = fixture.debugElement.query(By.css('.end-game-container'));
            expect(endGameMessage).toBeFalsy();
        });
    });
});
