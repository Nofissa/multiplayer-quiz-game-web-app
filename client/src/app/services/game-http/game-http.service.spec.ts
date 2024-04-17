import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { GameHttpService } from './game-http.service';

const gameSnapshotStub: GameSnapshot = {
    players: [],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Paused,
    currentQuestionIndex: 0,
    questionQcmSubmissions: [],
    questionQrlSubmission: [],
    questionQrlEvaluation: [],
};

describe('GameHttpService', () => {
    let service: GameHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameHttpService],
        });
        service = TestBed.inject(GameHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve game snapshot by pin', () => {
        const dummyPin = '123';
        const dummySnapshot = gameSnapshotStub;

        service.getGameSnapshotByPin(dummyPin).subscribe((snapshot) => {
            expect(snapshot).toEqual(dummySnapshot);
        });

        const request = httpMock.expectOne(`${service.apiUrl}/${dummyPin}/snapshot`);
        expect(request.request.method).toBe('GET');
        request.flush(dummySnapshot);
    });

    it('should handle errors properly', () => {
        const dummyPin = '123';
        const errorMessage = '404 Not Found';

        // eslint-disable-next-line deprecation/deprecation
        service.getGameSnapshotByPin(dummyPin).subscribe(
            () => {
                return;
            },
            (error) => {
                expect(error.status).toBe(HttpStatusCode.NotFound);
                expect(error.statusText).toBe('Not Found');
            },
        );

        const request = httpMock.expectOne(`${service.apiUrl}/${dummyPin}/snapshot`);
        request.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
});
