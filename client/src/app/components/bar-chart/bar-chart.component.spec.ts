import { ComponentFixture, TestBed } from '@angular/core/testing';
import { barChartDataStub } from '@app/test-stubs/bar-chart-data.stubs';
import { BarchartSubmission } from '@common/barchart-submission';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
    let component: BarChartComponent;
    let fixture: ComponentFixture<BarChartComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BarChartComponent],
        });
        fixture = TestBed.createComponent(BarChartComponent);
        component = fixture.componentInstance;
        component.data = barChartDataStub()[0];
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should adjust compute the right selection percentage', () => {
        const selectedIndex = 0;
        const answer = 100;
        const buff = component.adjust(selectedIndex);
        fixture.detectChanges();
        expect(buff).toEqual(answer);
    });

    it('should numberOfPlayers return the number of players who have submitted a submission', () => {
        const buff = component.numberOfPlayers();
        fixture.detectChanges();
        expect(buff).toEqual(2);
    });

    it('should numberOfPlayers return 0 if there are no player submissions', () => {
        component.data.submissions = [];
        const buff = component.numberOfPlayers();
        fixture.detectChanges();
        expect(buff).toEqual(0);
    });

    it('should playersSelected return the number of players having selected a particular choice', () => {
        const buff = component.playersSelected(0);
        fixture.detectChanges();
        expect(buff).toEqual(2);
    });

    it('should playersSelected return 0 if thre are no player submissions', () => {
        component.data.submissions = [];
        let buff = component.playersSelected(1);
        expect(buff).toEqual(0);
        component.data.submissions = undefined as unknown as BarchartSubmission[];
        buff = component.playersSelected(1);
        expect(buff).toEqual(0);
    });
});
