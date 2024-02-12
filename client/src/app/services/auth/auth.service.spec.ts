import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { UserCredentialSet } from '@common/user-credential-set';
import { AuthPayload } from '@common/auth-payload';

describe('AuthService', () => {
    let authService: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService],
        });

        authService = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(authService).toBeTruthy();
    });

    describe('login', () => {
        it('should send POST request to login endpoint with user credentials', () => {
            const userCredentialSet: UserCredentialSet = {
                username: 'admin',
                password: 'abc123',
            };
            const authPayloadMock: AuthPayload = {
                token: 'some token',
            };

            authService.login(userCredentialSet).subscribe((payload) => {
                expect(payload).toEqual(authPayloadMock);
            });

            const req = httpMock.expectOne(`${authService.apiUrl}/login`);
            expect(req.request.method).toBe('POST');
            req.flush(authPayloadMock);
        });

        it('should handle errors properly', () => {
            const userCredentialSet: UserCredentialSet = {
                username: 'admin',
                password: 'abc123',
            };
            const errorMessage = 'Wrong credentials';

            authService.login(userCredentialSet).subscribe({
                next: () => fail('Expected an error, but the request succeeded'),
                error: (error) => {
                    expect(error.message).toBeTruthy();
                },
            });

            const testRequest = httpMock.expectOne(`${authService.apiUrl}/login`);
            testRequest.flush(errorMessage, { status: 401, statusText: errorMessage });
        });
    });

    describe('verify', () => {
        it('should send POST request to verify endpoint with payload', () => {
            const mockAuthPayload: AuthPayload = {
                token: 'some token',
            };

            authService.verify(mockAuthPayload).subscribe();

            const req = httpMock.expectOne(`${authService.apiUrl}/verify`);
            expect(req.request.method).toBe('POST');
            req.flush({});
        });

        it('should handle errors properly', () => {
            const authPayloadMock: AuthPayload = {
                token: 'some token',
            };
            const errorMessage = 'Invalid token';

            authService.verify(authPayloadMock).subscribe({
                next: () => fail('Expected an error, but the request succeeded'),
                error: (error) => {
                    expect(error.message).toEqual(errorMessage);
                },
            });

            const testRequest = httpMock.expectOne(`${authService.apiUrl}/verify`);
            testRequest.flush(errorMessage, { status: 401, statusText: errorMessage });
        });
    });
});
