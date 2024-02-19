import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerComponentComponent } from './timer-component.component';

describe('TimerComponentComponent', () => {
    let component: TimerComponentComponent;
    let fixture: ComponentFixture<TimerComponentComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimerComponentComponent],
        });
        fixture = TestBed.createComponent(TimerComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
