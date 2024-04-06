import { ComponentFixture, TestBed } from '@angular/core/testing';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';
import { submissionStub } from '@app/test-stubs/submission.stubs';
import { Submission } from '@common/submission';
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
        component.data = {
            question: qcmQuestionStub()[0],
            submissions: [submissionStub()[0], submissionStub()[1], submissionStub()[2]],
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
        component.data.submissions = undefined as unknown as Submission[];
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
        component.data.submissions = [];
        fixture.detectChanges();
        const buff = component.adjust(1);
        fixture.detectChanges();
        expect(buff).toEqual(0);
    });
});
