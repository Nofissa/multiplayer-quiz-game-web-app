import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSummaryComponent } from './game-summary.component';

describe('GameSummaryComponent', () => {
    let component: GameSummaryComponent;
    let fixture: ComponentFixture<GameSummaryComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameSummaryComponent],
        });
        fixture = TestBed.createComponent(GameSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
