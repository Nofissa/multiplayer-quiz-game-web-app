import { TestBed } from '@angular/core/testing';
import { barChartDataStub } from '@app/TestStubs/bar-chart-data.stubs';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionsStub, submissionStub } from '@app/TestStubs/submission.stubs';
import { BarChartData } from '@app/interfaces/bar-chart-data';
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

    it('should updatebBarChartData when given a submission', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: [] }];
        service.updateBarChartData({ clientId: 'SomeID', submission: submissionStub()[0] });

        expect(service['barChartData']).toEqual([{ question: questionStub()[0], submissions: [submissionStub()[0]] }]);
    });

    it('should not update barChartData when given a bad clientId and a submission', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: [] }];
        service.updateBarChartData({ clientId: undefined as unknown as string, submission: submissionStub()[0] });
        expect(service.getCurrentQuestionData()).toEqual({ question: questionStub()[0], submissions: [] });
    });

    it('should getCurrentQuestionData get current BarChartData, or undefined if ther is no data', () => {
        service['barChartData'] = barChartDataStub();
        let latestBarChart = service.getCurrentQuestionData();
        if (latestBarChart) {
            expect(latestBarChart).toEqual(barChartDataStub()[1]);
        }
        service['barChartData'] = [];
        latestBarChart = service.getCurrentQuestionData();
        expect(latestBarChart).not.toBeDefined();
    });

    it('should get all bar chart data', () => {
        service['barChartData'] = barChartDataStub();
        const allBarChart = service.getAllBarChart();
        expect(allBarChart).toEqual(barChartDataStub());
    });

    it('should add question when question is valid', () => {
        service.addQuestion(questionStub()[0]);
        const mockBarChart: BarChartData = {
            question: questionStub()[0],
            submissions: [],
        };
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should not add question when question is not valid', () => {
        service.addQuestion(undefined as unknown as Question);
        expect(service['barChartData']).toEqual([]);
    });

    it('should setData populate the service when given data is correct', () => {
        service.setData({ submissions: submissionsStub(), questions: questionStub() });
        expect(service['barChartData']).toEqual(barChartDataStub());
    });

    it('should not update barChartData when given a bad clientId and submission', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: [] }];
        service.updateBarChartData({ clientId: 'someClientId', submission: undefined as unknown as Submission });
        expect(service.getCurrentQuestionData()).toEqual({ question: questionStub()[0], submissions: [] });
    });

    it('should not duplicate submissions when player toggles different choices one after the other', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: [] }];
        const mockElement3 = { clientId: 'someClientId', submission: submissionStub()[2] };
        const mockBarChart: BarChartData = {
            question: questionStub()[0],
            submissions: [mockElement3.submission],
        };
        service.updateBarChartData({ clientId: 'someClientId', submission: submissionStub()[0] });
        service.updateBarChartData({ clientId: 'someClientId', submission: submissionStub()[1] });
        service.updateBarChartData(mockElement3);
        expect(service.getCurrentQuestionData()).toEqual(mockBarChart);
    });

    it('should contain multiple players submissions', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: [] }];
        submissionsStub()[0].forEach((submission, clientId) => {
            service.updateBarChartData({ clientId: clientId.toString(), submission });
        });
        expect(service.getCurrentQuestionData()).toEqual(barChartDataStub()[0]);
    });

    it('should contain multiple barCharts', () => {
        service.addQuestion(questionStub()[0]);
        service.addQuestion(questionStub()[1]);
        expect(service['barChartData']).toEqual([
            {
                question: questionStub()[0],
                submissions: [],
            },
            {
                question: questionStub()[1],
                submissions: [],
            },
        ]);
    });

    it('should update last barChart when logging new submissions', () => {
        service['barChartData'] = [
            { question: questionStub()[0], submissions: [] },
            { question: questionStub()[1], submissions: [] },
        ];
        service.updateBarChartData({ clientId: 'someClientId', submission: submissionStub()[0] });
        const mockBarChartContainer: BarChartData[] = [
            {
                question: questionStub()[0],
                submissions: [],
            },
            {
                question: questionStub()[1],
                submissions: [submissionStub()[0]],
            },
        ];
        expect(service.getAllBarChart()).toEqual(mockBarChartContainer);
    });
});
