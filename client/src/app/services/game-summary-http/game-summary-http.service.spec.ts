import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { gameSummaryStub } from '@app/test-stubs/game-summary.stubs';
import { environment } from 'src/environments/environment';
import { GameSummaryHttpService } from './game-summary-http.service';

describe('GameSummaryHttpService', () => {
    let service: GameSummaryHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameSummaryHttpService],
        });
        service = TestBed.inject(GameSummaryHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve all game summaries', () => {
        service.getAllGameSummaries().subscribe((summaries) => {
            expect(summaries.length).toBe(1);
            expect(summaries).toEqual([gameSummaryStub]);
        });

        const req = httpMock.expectOne(`${service.apiUrl}`);
        expect(req.request.method).toBe('GET');
        req.flush([gameSummaryStub]);
    });

    it('should handle error on retrieving game summaries', () => {
        service.getAllGameSummaries().subscribe({
            next: () => fail('should have failed with 404 error'),
            error: (error: HttpErrorResponse) => {
                expect(error.status).toEqual(HttpStatusCode.NotFound);
                expect(error.error).toEqual('test 404 error');
            },
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/gameSummaries`);
        req.flush('test 404 error', { status: 404, statusText: 'Not Found' });
    });

    it('should send a delete request to clear all game summaries', () => {
        service.clearAllGameSummaries().subscribe((response) => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne(`${service.apiUrl}/deleteAll`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
