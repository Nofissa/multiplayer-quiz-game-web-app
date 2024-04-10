import { TestBed } from '@angular/core/testing';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { barChartDataStub } from '@app/TestStubs/bar-chart-data.stubs';
import { qcmQuestionStub } from '@app/TestStubs/question.stubs';
import { mockSnapshotStubs } from '@app/TestStubs/snapshot.stubs';
import { GameSnapshot } from '@common/game-snapshot';
import { Question } from '@common/question';
import { BarChartService } from './bar-chart.service';
import { BarchartElement } from '@app/interfaces/barchart-element';

fdescribe('BarChartService', () => {
    let service: BarChartService;
    let mockSnapshot: GameSnapshot;
    beforeEach(() => {
        mockSnapshot = mockSnapshotStubs()[0];
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
        const question = qcmQuestionStub()[0];
        const mockChartElements: BarchartElement[] = [];
        question.choices?.forEach((choice) => mockChartElements.push({ text: choice.text, isCorrect: choice.isCorrect }));
        service.addQuestion(question);
        const mockBarChart: BarChartData = {
            text: question.text,
            chartType: 'QCM',
            chartElements: mockChartElements,
            submissions: [],
        };
        expect(service['barChartData']).toEqual([mockBarChart]);
    });

    it('should not add question when question is not valid', () => {
        service.addQuestion(undefined as unknown as Question);
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
});
