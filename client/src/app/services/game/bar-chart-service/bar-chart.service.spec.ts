import { TestBed } from '@angular/core/testing';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { barChartDataStub } from '@app/TestStubs/bar-chart-data.stubs';
import { qcmQuestionStub } from '@app/TestStubs/question.stubs';
import { submissionsStub, submissionStub } from '@app/TestStubs/submission.stubs';
import { Question } from '@common/question';
import { QcmSubmission } from '@common/qcm-submission';
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
        service.addQuestion(qcmQuestionStub()[0]);
        const mockBarChart: BarChartData = {
            text: qcmQuestionStub()[0],
            submissions: [],
        };
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should not add question when question is not valid', () => {
        service.addQuestion(undefined as unknown as Question);
        expect(service['barChartData']).toEqual([]);
    });

    it('should setData populate the service when given data is correct', () => {
        service.setData({ submissions: submissionsStub(), questions: qcmQuestionStub() });
        expect(service['barChartData']).toEqual(barChartDataStub());
    });

    it('should not update barChartData when given a bad clientId and submission', () => {
        service['barChartData'] = [{ question: qcmQuestionStub()[0], submissions: [] }];
        service.updateBarChartData(undefined as unknown as QcmSubmission[]);
        expect(service.getCurrentQuestionData()).toEqual({ question: qcmQuestionStub()[0], submissions: [] });
    });

    it('should contain multiple players submissions', () => {
        service['barChartData'] = [{ question: qcmQuestionStub()[0], submissions: [] }];

        service.updateBarChartData(submissionStub());

        expect(service.getCurrentQuestionData()).toEqual(barChartDataStub()[0]);
    });

    it('should contain multiple barCharts', () => {
        service['barChartData'] = barChartDataStub();
        expect(service['barChartData']).toEqual(barChartDataStub());
    });

    it('should update last barChart when logging new submissions', () => {
        service['barChartData'] = [
            { question: qcmQuestionStub()[0], submissions: [] },
            { question: qcmQuestionStub()[1], submissions: [] },
        ];
        service.updateBarChartData(submissionStub());
        const mockBarChartContainer: BarChartData[] = [
            {
                question: qcmQuestionStub()[0],
                submissions: [],
            },
            {
                question: qcmQuestionStub()[1],
                submissions: submissionStub(),
            },
        ];
        expect(service.getAllBarChart()).toEqual(mockBarChartContainer);
    });

    it('should flushData reset barChartData to []', () => {
        service['barChartData'] = barChartDataStub();
        service.flushData();
        expect(service['barChartData']).toEqual([]);
    });
});
