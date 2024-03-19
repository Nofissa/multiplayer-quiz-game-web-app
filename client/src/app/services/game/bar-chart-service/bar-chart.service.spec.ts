import { TestBed } from '@angular/core/testing';
import { barChartDataStub } from '@app/TestStubs/bar-chart-data.stubs';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionMapStub, submissionStub } from '@app/TestStubs/submission.stubs';
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
        service['barChartData'] = [{ question: questionStub()[0], submissions: new Map() }];
        service.updateBarChartData({ clientId: 'SomeID', submission: submissionStub()[0] });
        expect(service['barChartData']).toEqual([{ question: questionStub()[0], submissions: new Map([['SomeID', submissionStub()[0]]]) }]);
    });

    it('should not update barChartData when given a bad clientId and a submission', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: new Map() }];
        service.updateBarChartData({ clientId: undefined as unknown as string, submission: submissionStub()[0] });
        expect(service.getCurrentQuestionData()).toEqual({ question: questionStub()[0], submissions: new Map() });
    });

    it('should getCurrentQuestionData get current BarChartData', () => {
        service['barChartData'] = barChartDataStub();
        const latestBarChart = service.getCurrentQuestionData();
        if (latestBarChart) {
            expect(latestBarChart).toEqual(barChartDataStub()[1]);
        }
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
            submissions: new Map(),
        };
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should not add question when question is not valid', () => {
        service.addQuestion(undefined as unknown as Question);
        expect(service['barChartData']).toEqual([]);
    });

    it('should setData populate the service when given data is correct', () => {
        service.setData({ submissions: submissionMapStub(), questions: questionStub() });
        expect(service['barChartData']).toEqual(barChartDataStub());
    });

    it('should not update barChartData when given a bad clientId and submission', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: new Map() }];
        service.updateBarChartData({ clientId: 'someClientId', submission: undefined as unknown as Submission });
        expect(service.getCurrentQuestionData()).toEqual({ question: questionStub()[0], submissions: new Map() });
    });

    it('should not duplicate submissions when player toggles different choices one after the other', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: new Map() }];
        const mockElement3 = { clientId: 'someClientId', submission: submissionStub()[2] };
        const mockBarChart: BarChartData = {
            question: questionStub()[0],
            submissions: new Map<string, Submission>([[mockElement3.clientId, mockElement3.submission]]),
        };
        service.updateBarChartData({ clientId: 'someClientId', submission: submissionStub()[0] });
        service.updateBarChartData({ clientId: 'someClientId', submission: submissionStub()[1] });
        service.updateBarChartData(mockElement3);
        expect(service.getCurrentQuestionData()).toEqual(mockBarChart);
    });

    it('should contain multiple players submissions', () => {
        service['barChartData'] = [{ question: questionStub()[0], submissions: new Map() }];
        submissionMapStub()[0].forEach((submission, clientId) => {
            service.updateBarChartData({ clientId, submission });
        });
        expect(service.getCurrentQuestionData()).toEqual(barChartDataStub()[0]);
    });

    it('should contain multiple barCharts', () => {
        service.addQuestion(questionStub()[0]);
        service.addQuestion(questionStub()[1]);
        expect(service['barChartData']).toEqual([
            {
                question: questionStub()[0],
                submissions: new Map<string, Submission>(),
            },
            {
                question: questionStub()[1],
                submissions: new Map<string, Submission>(),
            },
        ]);
    });

    it('should update last barChart when logging new submissions', () => {
        service['barChartData'] = [
            { question: questionStub()[0], submissions: new Map() },
            { question: questionStub()[1], submissions: new Map() },
        ];
        service.updateBarChartData({ clientId: 'someClientId', submission: submissionStub()[0] });
        const mockBarChartContainer: BarChartData[] = [
            {
                question: questionStub()[0],
                submissions: new Map<string, Submission>(),
            },
            {
                question: questionStub()[1],
                submissions: new Map<string, Submission>([['someClientId', submissionStub()[0]]]),
            },
        ];
        expect(service.getAllBarChart()).toEqual(mockBarChartContainer);
    });
});
