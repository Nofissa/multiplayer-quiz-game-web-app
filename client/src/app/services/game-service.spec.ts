import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Choice } from '@common/choice';
import { EvaluationPayload } from '@common/evaluation-payload';
import { GameService } from './game-service';

describe('GameService', () => {
    let service: GameService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameService],
        });
        service = TestBed.inject(GameService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate answers', () => {
        const selectedChoices: Choice[] = [{ text: 'Choice 1', isCorrect: true }];
        const quizID = 'nd329d0jn';
        const questionIndex = 0;

        const expectedPayload: EvaluationPayload = {
            correctAnswers: selectedChoices,
            score: 10,
        };

        service.validateAnswers(selectedChoices, quizID, questionIndex).subscribe((response) => {
            expect(response).toEqual(expectedPayload);
        });

        const request = httpTestingController.expectOne(`${service.apiURl}/evaluateChoices/${quizID}?questionIndex=${questionIndex}`);
        expect(request.request.method).toEqual('POST');
        request.flush(expectedPayload);
    });

    it('should check if choices are correct', () => {
        const correctChoices: Choice[] = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: true },
        ];
        const incorrectChoices: Choice[] = [
            { text: 'Choice 3', isCorrect: false },
            { text: 'Choice 4', isCorrect: false },
        ];

        expect(service.areChoicesCorrect(correctChoices)).toBe(true);
        expect(service.areChoicesCorrect(incorrectChoices)).toBe(false);
    });
});
