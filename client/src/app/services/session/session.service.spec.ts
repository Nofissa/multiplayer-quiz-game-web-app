import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
    let service: SessionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SessionService],
        });
        service = TestBed.inject(SessionService);
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setSession', () => {
        it('should set session in localStorage', () => {
            const token = 'test-token';
            service.setSession(token);
            expect(localStorage.getItem('authToken')).toEqual(token);
        });
    });

    describe('getSession', () => {
        it('should retrieve session from localStorage if session is set', () => {
            const token = 'test-token';
            localStorage.setItem('authToken', token);
            const retrievedToken = service.getSession();
            expect(retrievedToken).toEqual(token);
        });

        it('should retrieve null if session does not exist', () => {
            const retrievedToken = service.getSession();
            expect(retrievedToken).toBeNull();
        });
    });
});
