import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('GameService', () => {
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(httpTestingController).toBeTruthy();
    });
});
