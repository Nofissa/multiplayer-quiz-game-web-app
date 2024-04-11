// For mongodb's _id fields
/* eslint-disable no-underscore-dangle */
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizHttpService } from './quiz-http.service';
import { Quiz } from '@common/quiz';
import { HttpErrorResponse } from '@angular/common/http';

describe('QuizHttpService', () => {
    let service: QuizHttpService;
    let httpMock: HttpTestingController;
    const quizzesMock: Quiz[] = [
        {
            _id: '',
            id: '1a2b3c',
            title: 'Quiz 1',
            description: 'Description Quiz 1',
            duration: 60,
            lastModification: new Date(),
            isHidden: true,
            questions: [],
        },
        {
            _id: '',
            id: '4d5e6f',
            title: 'Quiz 2',
            description: 'Description Quiz 2',
            duration: 60,
            lastModification: new Date(),
            isHidden: false,
            questions: [],
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuizHttpService],
        });
        service = TestBed.inject(QuizHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve all quizzes with GET', () => {
        service.getAllQuizzes().subscribe((quizzes) => {
            expect(quizzes).toEqual(quizzesMock);
        });

        const testRequest = httpMock.expectOne(service.apiUrl);
        expect(testRequest.request.method).toBe('GET');
        testRequest.flush(quizzesMock);
    });

    it('should retrieve visible quizzes with GET', () => {
        const visibleQuizzesMock: Quiz[] = quizzesMock.filter((x) => !x.isHidden);

        service.getVisibleQuizzes().subscribe((quizzes) => {
            expect(quizzes).toEqual(visibleQuizzesMock);
        });

        const testRequest = httpMock.expectOne(`${service.apiUrl}?visibleOnly=true`);
        expect(testRequest.request.method).toBe('GET');
        testRequest.flush(visibleQuizzesMock);
    });

    it('should retrieve a quiz by ID with GET', () => {
        const quizMock: Quiz = quizzesMock[0];

        service.getQuizById(quizMock._id).subscribe((quiz) => {
            expect(quiz).toEqual(quizMock);
        });

        const testRequest = httpMock.expectOne(`${service.apiUrl}/${quizMock._id}`);
        expect(testRequest.request.method).toBe('GET');
        testRequest.flush(quizMock);
    });

    it('should retrieve a visible quiz by ID with GET', () => {
        const visibleQuizMock: Quiz = quizzesMock.filter((x) => !x.isHidden)[0];

        service.getVisibleQuizById(visibleQuizMock._id).subscribe((quiz) => {
            expect(quiz).toEqual(visibleQuizMock);
        });

        const testRequest = httpMock.expectOne(`${service.apiUrl}/${visibleQuizMock._id}?visibleOnly=true`);
        expect(testRequest.request.method).toBe('GET');
        testRequest.flush(visibleQuizMock);
    });

    it('should create a quiz with POST', () => {
        const mockQuiz: Quiz = quizzesMock[0];

        service.createQuiz(mockQuiz).subscribe((quiz) => {
            expect(quiz).toEqual(mockQuiz);
        });

        const testRequest = httpMock.expectOne(service.apiUrl);
        expect(testRequest.request.method).toBe('POST');
        testRequest.flush(mockQuiz);
    });

    it('should update a quiz with PUT', () => {
        const quizMock: Quiz = quizzesMock[0];

        service.updateQuiz(quizMock).subscribe((quiz) => {
            expect(quiz).toEqual(quizMock);
        });

        const testRequest = httpMock.expectOne(service.apiUrl);
        expect(testRequest.request.method).toBe('PUT');
        testRequest.flush(quizMock);
    });

    it('should delete a quiz by ID with DELETE', () => {
        const quizId = 'testId';

        service.deleteQuizById(quizId).subscribe();

        const testRequest = httpMock.expectOne(`${service.apiUrl}/${quizId}`);
        expect(testRequest.request.method).toBe('DELETE');
        testRequest.flush({});
    });

    it('should hide a visible quiz by ID with PATCH', () => {
        const visibleQuizMock: Quiz = quizzesMock.filter((x) => !x.isHidden)[0];

        service.hideQuizById(visibleQuizMock._id).subscribe((hiddenQuiz) => {
            expect(hiddenQuiz.isHidden).toBeTrue();
        });

        const testRequest = httpMock.expectOne(`${service.apiUrl}/hide/${visibleQuizMock._id}`);
        expect(testRequest.request.method).toBe('PATCH');
        testRequest.flush({ ...visibleQuizMock, isHidden: !visibleQuizMock.isHidden });
    });

    it('should expose a hidden quiz by ID with PATCH', () => {
        const hiddenQuizMock: Quiz = quizzesMock.filter((x) => x.isHidden)[0];

        service.hideQuizById(hiddenQuizMock._id).subscribe((visibleQuiz) => {
            expect(visibleQuiz.isHidden).toBeFalse();
        });

        const testRequest = httpMock.expectOne(`${service.apiUrl}/hide/${hiddenQuizMock._id}`);
        expect(testRequest.request.method).toBe('PATCH');
        testRequest.flush({ ...hiddenQuizMock, isHidden: !hiddenQuizMock.isHidden });
    });

    it('should handle HTTP errors', () => {
        const errorMessage = 'Internal Server Error';
        service.getAllQuizzes().subscribe({
            next: () => fail('Expected an error, but the request succeeded'),
            error: (errorResponse: HttpErrorResponse) => {
                expect(errorResponse.error).toEqual(errorMessage);
            },
        });

        const testRequest = httpMock.expectOne(service.apiUrl);
        testRequest.flush(errorMessage, { status: 500, statusText: errorMessage });
    });
});
