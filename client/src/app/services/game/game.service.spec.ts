import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Choice } from '@common/choice';
import { EvaluationPayload } from '@common/evaluation-payload';
import { GameService } from './game.service';

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

    describe('validateAnswers', () => {
        it('should send POST request to evaluateChoices endpoint', () => {
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

            const request = httpTestingController.expectOne(`${service.apiUrl}/evaluateChoices/${quizID}?questionIndex=${questionIndex}`);
            expect(request.request.method).toEqual('POST');
            request.flush(expectedPayload);
        });

        it('should handle errors properly', () => {
            const selectedChoices: Choice[] = [{ text: 'Choice 1', isCorrect: true }];
            const quizID = 'nd329d0jn';
            const questionIndex = 0;

            service.validateAnswers(selectedChoices, quizID, questionIndex).subscribe({
                next: () => fail('Expected an error, but the request succeeded'),
                error: (error) => {
                    expect(error.message).toBeTruthy();
                },
            });

            const testRequest = httpTestingController.expectOne(`${service.apiUrl}/evaluateChoices/${quizID}?questionIndex=${questionIndex}`);
            testRequest.flush('Answer validation failed', { status: 500, statusText: 'Internal server error' });
        });
    });
});
