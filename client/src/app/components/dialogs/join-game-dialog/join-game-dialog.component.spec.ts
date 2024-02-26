import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGameDialogComponent } from './join-game-dialog.component';

describe('JoinGameDialogComponent', () => {
    let component: JoinGameDialogComponent;
    let fixture: ComponentFixture<JoinGameDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JoinGameDialogComponent],
        });
        fixture = TestBed.createComponent(JoinGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
