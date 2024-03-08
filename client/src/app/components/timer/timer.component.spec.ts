import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [TimerService],
        });
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
