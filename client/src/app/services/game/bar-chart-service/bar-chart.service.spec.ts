import { TestBed } from '@angular/core/testing';
import { barChartDataStub } from '@app/TestStubs/bar-chart-data.stubs';
import { qcmQuestionStub, qrlQuestionStub } from '@app/TestStubs/question.stubs';
import { mockSnapshotStubs } from '@app/TestStubs/snapshot.stubs';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarchartElement } from '@app/interfaces/barchart-element';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameSnapshot } from '@common/game-snapshot';
import { Question } from '@common/question';
import { BarChartService } from './bar-chart.service';

describe('BarChartService', () => {
    let service: BarChartService;
    let mockSnapshot: GameSnapshot;
    beforeEach(() => {
        mockSnapshot = mockSnapshotStubs()[3];
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
            expect(latestBarChart).toEqual(barChartDataStub()[barChartDataStub().length - 1]);
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

    it('should add chart when question is valid', () => {
        const question = qcmQuestionStub()[0];
        const mockChartElements: BarchartElement[] = [];
        question.choices?.forEach((choice) => mockChartElements.push({ text: choice.text, isCorrect: choice.isCorrect }));
        service.addChart(question);
        const mockBarChart: BarChartData = {
            text: question.text,
            chartType: 'QCM',
            chartElements: mockChartElements,
            submissions: [],
        };
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should add chart when question is valid and chart tyépe is activity', () => {
        const question = qrlQuestionStub()[0];
        const mockChartElements: BarchartElement[] = [{ text: 'inactif' }, { text: 'actif' }];
        const mockBarChart: BarChartData = {
            text: 'Activité pour la question: ' + question.text,
            chartType: 'ACTIVITY',
            chartElements: mockChartElements,
            submissions: [],
        };
        service.addChart(question, 'ACTIVITY');
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should update chart when BarchartSubmission is valid', () => {
        const newChartSubmission: BarchartSubmission = {
            clientId: 'Some Id',
            index: 0,
            isSelected: false,
        };
        const mockBarChart: BarChartData = barChartDataStub()[0];
        service['barChartData'] = [mockBarChart];
        service.updateChartData(newChartSubmission);
        mockBarChart.submissions.push(newChartSubmission);
        expect(service['barChartData']).toEqual([mockBarChart]);
        newChartSubmission.isSelected = true;
        service.updateChartData(newChartSubmission);
        mockBarChart.submissions.pop();
        mockBarChart.submissions.push(newChartSubmission);
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should update chart toggle active state in the barchart submissions for and ACTIVITY chart', () => {
        const newChartSubmission: BarchartSubmission[] = [
            {
                clientId: 'Some Id',
                index: 0,
                isSelected: true,
            },
            {
                clientId: 'Some Id',
                index: 1,
                isSelected: false,
            },
        ];
        const mockBarChart: BarChartData = barChartDataStub()[0];
        mockBarChart.submissions = newChartSubmission;
        service['barChartData'] = [mockBarChart];
        service.updateChartData({
            clientId: 'Some Id',
            index: 1,
            isSelected: true,
        });
        mockBarChart.submissions.pop();
        mockBarChart.submissions.push({
            clientId: 'Some Id',
            index: 1,
            isSelected: false,
        });
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should not add chart when question is not valid', () => {
        service.addChart(undefined as unknown as Question);
        expect(service['barChartData']).toEqual([]);
    });

    it('should setData populate the service when given data is correct', () => {
        service.setData(mockSnapshot);
        expect(service['barChartData']).toEqual(barChartDataStub());
    });

    it('should contain multiple barCharts', () => {
        service['barChartData'] = barChartDataStub();
        expect(service['barChartData']).toEqual(barChartDataStub());
    });

    it('should flushData reset barChartData to []', () => {
        service['barChartData'] = barChartDataStub();
        service.flushData();
        expect(service['barChartData']).toEqual([]);
    });

    it('should flushData reset barChartData to []', () => {
        service['barChartData'] = barChartDataStub();
        service.flushData();
        expect(service['barChartData']).toEqual([]);
    });
});
