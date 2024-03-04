import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerResultsPageComponent } from './player-results-page.component';

describe('PlayerResultsPageComponent', () => {
    let component: PlayerResultsPageComponent;
    let fixture: ComponentFixture<PlayerResultsPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerResultsPageComponent],
        });
        fixture = TestBed.createComponent(PlayerResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
