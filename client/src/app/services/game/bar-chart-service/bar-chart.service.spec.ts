import { TestBed } from '@angular/core/testing';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionStub } from '@app/TestStubs/submission.stubs';
import { Question } from '@common/question';
import { Submission } from '@common/submission';
import { BarChartService } from './bar-chart.service';

describe('BarChartService', () => {
    let service: BarChartService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BarChartService],
        });
        service = TestBed.inject(BarChartService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a question', () => {
        const question: Question = questionStub()[1];
        service.addQuestion(question);

        const latestBarChart = service.getLatestBarChart();
        expect(latestBarChart.question).toEqual(question);
        expect(latestBarChart.submissions).toEqual([]);
    });

    it('should update bar chart data with submissions', () => {
        const submissions: Submission[] = [submissionStub()[0], submissionStub()[1], submissionStub()[2]];
        service.updateBarChartData(submissions);

        const latestBarChart = service.getLatestBarChart();
        expect(latestBarChart.submissions).toEqual(submissions);
    });

    it('should get the latest bar chart data', () => {
        const question1: Question = questionStub()[0];
        const question2: Question = questionStub()[1];

        service.addQuestion(question1);
        service.addQuestion(question2);

        const latestBarChart = service.getLatestBarChart();
        expect(latestBarChart.question).toEqual(question2);
    });

    it('should get all bar chart data', () => {
        const question1: Question = questionStub()[0];
        const question2: Question = questionStub()[1];

        service.addQuestion(question1);
        service.addQuestion(question2);

        const allBarChart = service.getAllBarChart();
        expect(allBarChart.length).toBe(2);
        expect(allBarChart[0].question).toEqual(question1);
        expect(allBarChart[1].question).toEqual(question2);
    });
});
