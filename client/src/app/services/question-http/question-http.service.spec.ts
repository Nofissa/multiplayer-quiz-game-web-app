// for mongodb id
/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Question } from '@common/question';
import { QuestionHttpService } from './question-http.service';

describe('QuestionHttpService', () => {
    let service: QuestionHttpService;
    let httpMock: HttpTestingController;
    const questionsMock: Question[] = [
        {
            _id: '1a2b3c',
            text: 'Sample question 1',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        },
        {
            _id: '4d5e6f',
            text: 'Sample question 2',
            type: 'QCM',
            points: 60,
            choices: [],
            lastModification: new Date(),
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuestionHttpService],
        });
        service = TestBed.inject(QuestionHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve all questions with GET', () => {
        service.getAllQuestions().subscribe((questions) => {
            expect(questions).toEqual(questionsMock);
        });

        const testRequest = httpMock.expectOne(service.apiUrl);
        expect(testRequest.request.method).toBe('GET');
        testRequest.flush(questionsMock);
    });

    it('should create a question with POST', () => {
        const questionMock: Question = {
            _id: '1',
            text: 'Sample question 1',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };

        service.createQuestion(questionMock).subscribe((question) => {
            expect(question).toEqual(questionMock);
        });

        const postRequest = httpMock.expectOne(service.apiUrl);
        expect(postRequest.request.method).toBe('POST');

        postRequest.flush(questionMock);

        const getRequest = httpMock.expectOne(service.apiUrl);
        expect(getRequest.request.method).toBe('GET');

        const mockQuestions: Question[] = [questionMock];
        getRequest.flush(mockQuestions);

        httpMock.verify();
    });

    it('should update a question with PUT', () => {
        const questionMock = questionsMock[0];

        service.updateQuestion(questionMock).subscribe((question) => {
            expect(question).toEqual(questionMock);
        });

        const putRequest = httpMock.expectOne(service.apiUrl);
        expect(putRequest.request.method).toBe('PUT');

        putRequest.flush(questionMock);

        const getRequest = httpMock.expectOne(service.apiUrl);
        expect(getRequest.request.method).toBe('GET');

        const mockQuestions: Question[] = [questionMock];
        getRequest.flush(mockQuestions);

        httpMock.verify();
    });

    it('should delete a question by ID with DELETE', () => {
        const questionMock = questionsMock[0];

        service.deleteQuestionById(questionMock._id).subscribe();

        const deleteRequest = httpMock.expectOne(`${service.apiUrl}/${questionMock._id}`);
        expect(deleteRequest.request.method).toBe('DELETE');

        deleteRequest.flush(questionMock);

        const getRequest = httpMock.expectOne(service.apiUrl);
        expect(getRequest.request.method).toBe('GET');

        const mockQuestions: Question[] = [questionMock];
        getRequest.flush(mockQuestions);

        httpMock.verify();
    });

    it('should handle HTTP errors', () => {
        const errorMessage = 'Internal Server Error';
        service.getAllQuestions().subscribe({
            next: () => fail('Expected an error, but the request succeeded'),
            error: (error) => {
                expect(error.message).toEqual(errorMessage);
            },
        });

        const testRequest = httpMock.expectOne(service.apiUrl);
        testRequest.flush(errorMessage, { status: 500, statusText: errorMessage });
    });
});
