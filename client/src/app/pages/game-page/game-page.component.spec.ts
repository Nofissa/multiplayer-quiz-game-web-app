import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
// import { Quiz } from '@app/interfaces/quiz';
// import { of, throwError } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('gamePage', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // let quizHttpService: jasmine.SpyObj<QuizHttpService>;

    const mockActivatedRoute = {
        snapshot: {
            queryParams: {
                quizId: 'a1b2c3',
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
        // quizHttpService = TestBed.inject(QuizHttpService) as jasmine.SpyObj<QuizHttpService>;
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

    // it('should go in test mode when queryParams isTest is true', () => {
    //     fixture = TestBed.createComponent(GamePageComponent);
    //     component = fixture.componentInstance;
    //     component.loadMode();

    //     expect(component.isTest).toBe(true);
    // });

    // it('should load quiz from the server when quizId is present in queryParams', fakeAsync(() => {
    //     spyOn(quizHttpService, 'getVisibleQuizById');
    //     const mockQuiz: Quiz = {
    //         id: 'a1b2c3',
    //         title: 'testing',
    //         description: 'test quiz',
    //         duration: 20,
    //         lastModification: new Date(),
    //         questions: [
    //             {
    //                 type: 'QCM',
    //                 text: 'Sample Question Text',
    //                 points: 10,
    //                 choices: [
    //                     { text: 'Choice 1', isCorrect: true },
    //                     { text: 'Choice 2', isCorrect: false },
    //                 ],
    //                 lastModification: new Date(),
    //                 _id: 'dheoh30hd380',
    //             },
    //         ],
    //         isHidden: null,
    //         _id: 'a1b2c3',
    //     };
    //     quizHttpService.getVisibleQuizById.and.returnValue(of(mockQuiz));
    //     component.loadQuiz();
    //     tick();

    //     expect(quizHttpService.getVisibleQuizById).toHaveBeenCalledWith('a1b2c3');
    //     expect(component.quiz).toEqual(mockQuiz);
    // }));

    // it('should navigate to /create-game if there is an error loading the quiz', fakeAsync(() => {
    //     spyOn(quizHttpService, 'getVisibleQuizById').and.returnValue(throwError(() => 'Error'));
    //     spyOn(component['router'], 'navigateByUrl');

    //     component.loadQuiz();
    //     tick();

    //     expect(component['router'].navigateByUrl).toHaveBeenCalledWith('/create-game');
    // }));
});
