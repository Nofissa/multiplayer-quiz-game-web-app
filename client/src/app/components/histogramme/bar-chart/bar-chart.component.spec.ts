import { ComponentFixture, TestBed } from '@angular/core/testing';

import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionStub } from '@app/TestStubs/submission.stubs';
import { Submission } from '@common/submission';
import { BarChartComponent } from './bar-chart.component';

fdescribe('HistogrammeComponent', () => {
    let component: BarChartComponent;
    let fixture: ComponentFixture<BarChartComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BarChartComponent],
        });
        fixture = TestBed.createComponent(BarChartComponent);
        component = fixture.componentInstance;
        component.data = {
            question: questionStub()[0],
            submissions: new Map<string, Submission>([
                ['SomeClientID1', submissionStub()[0]],
                ['SomeClientID2', submissionStub()[1]],
                ['SomeClientID3', submissionStub()[2]],
            ]),
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should adjust compute the right selection percentage', () => {
        const answer = 33;
        const buff = component.adjust(0);
        fixture.detectChanges();
        expect(buff).toEqual(answer);
    });

    it('should numberOfPlayers return the number of players having selected something', () => {
        const buff = component.numberOfPlayers();
        fixture.detectChanges();
        expect(buff).toEqual(3);
    });

    it('should numberOfPlayers return 0 if there are no player submissions', () => {
        component.data.submissions = undefined as unknown as Map<string, Submission>;
        const buff = component.numberOfPlayers();
        fixture.detectChanges();
        expect(buff).toEqual(0);
    });

    it('should playersSelected return the number of players having selected a particular choice', () => {
        const buff = component.playersSelected(0);
        fixture.detectChanges();
        expect(buff).toEqual(1);
    });

    it('should playersSelected return 0 if thre are no player submissions', () => {
        component.data.submissions = new Map();
        fixture.detectChanges();
        const buff = component.adjust(1);
        fixture.detectChanges();
        expect(buff).toEqual(0);
    });
});
