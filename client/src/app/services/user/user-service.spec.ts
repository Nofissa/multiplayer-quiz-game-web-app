import { TestBed } from '@angular/core/testing';
import { UserService } from '@app/services/user/user-service';

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UserService],
        });
        service = TestBed.inject(UserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get username correctly', () => {
        const username = 'testUser';
        service.setUsername(username);
        expect(service.getUsername()).toEqual(username);
    });
});
