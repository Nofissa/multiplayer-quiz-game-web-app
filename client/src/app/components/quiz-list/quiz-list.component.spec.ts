import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { QuizListComponent } from './quiz-list.component';

describe('QuizListComponent', () => {
    let component: QuizListComponent;
    let fixture: ComponentFixture<QuizListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizListComponent],
            imports: [MatDialogModule, HttpClientTestingModule, MatSnackBarModule],
        });
        fixture = TestBed.createComponent(QuizListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
