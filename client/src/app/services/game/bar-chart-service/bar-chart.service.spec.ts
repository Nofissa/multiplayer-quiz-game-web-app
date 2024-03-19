// import { TestBed } from '@angular/core/testing';
// import { questionStub } from '@app/TestStubs/question.stubs';
// import { submissionStub } from '@app/TestStubs/submission.stubs';
// import { Question } from '@common/question';
// import { Submission } from '@common/submission';
// import { BarChartService } from './bar-chart.service';

// describe('BarChartService', () => {
//     let service: BarChartService;
//     let barChartServiceSpy: BarChartService;
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             providers: [BarChartService],
//         });
//         service = TestBed.inject(BarChartService);
//         barChartServiceSpy = TestBed.inject(BarChartService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should add a question', () => {
//         const question: Question = questionStub()[1];
//         service.addQuestion(question);

//         const latestBarChart = service.getLatestBarChart();
//         expect(latestBarChart.question).toEqual(question);
//         expect(latestBarChart.submissions).toEqual([]);
//     });

//     it('should update bar chart data with submissions', () => {
//         const submissions: Submission[] = [submissionStub()[0], submissionStub()[1], submissionStub()[2]];
//         service.updateBarChartData(submissions);

//         const latestBarChart = service.getLatestBarChart();
//         expect(latestBarChart.submissions).toEqual(submissions);
//     });

//     it('should get the latest bar chart data', () => {
//         const question1: Question = questionStub()[0];
//         const question2: Question = questionStub()[1];

//         service.addQuestion(question1);
//         service.addQuestion(question2);

//         const latestBarChart = service.getLatestBarChart();
//         expect(latestBarChart.question).toEqual(question2);
//     });

//     it('should get all bar chart data', () => {
//         const question1: Question = questionStub()[0];
//         const question2: Question = questionStub()[1];

//         service.addQuestion(question1);
//         service.addQuestion(question2);

//         const allBarChart = service.getAllBarChart();
//         expect(allBarChart.length).toBe(2);
//         expect(allBarChart[0].question).toEqual(question1);
//         expect(allBarChart[1].question).toEqual(question2);
//     });

//     it('should add question when question is valid', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         const mockBarChart: BarChartData = {
//             question: questionStub()[0],
//             submissions: new Map(),
//         };
//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(mockBarChart);
//     });

//     it('should not add question when question is not valid', () => {
//         barChartServiceSpy.addQuestion(undefined as unknown as Question);
//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(undefined);
//     });

//     it('should setData populate the service when given data is correct', () => {
//         const submissionMap = new Map<string, Submission>([
//             ['SomeClientID1', submissionStub()[0]],
//             ['SomeClientID2', submissionStub()[1]],
//             ['SomeClientID3', submissionStub()[2]],
//         ]);

//         const subMissionMapArray = [submissionMap, submissionMap];
//         barChartServiceSpy.setData({ submissions: subMissionMapArray, questions: questionStub() });

//         const mockBarChartContainer: BarChartData[] = [
//             {
//                 question: questionStub()[0],
//                 submissions: submissionMap,
//             },
//             {
//                 question: questionStub()[1],
//                 submissions: submissionMap,
//             },
//         ];
//         expect(barChartServiceSpy.getAllBarChart()).toEqual(mockBarChartContainer);
//     });

//     it('should update barChartData when given a clientId and submission', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         const mockElement = { clientId: 'someClientId', submission: submissionStub()[0] };
//         const mockBarChart: BarChartData = {
//             question: questionStub()[0],
//             submissions: new Map<string, Submission>([[mockElement.clientId, mockElement.submission]]),
//         };
//         barChartServiceSpy.updateBarChartData(mockElement);
//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(mockBarChart);
//     });

//     it('should not update barChartData when given a bad clientId and a submission', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         const mockElement = { clientId: undefined as unknown as string, submission: submissionStub()[0] };
//         const mockBarChart: BarChartData = {
//             question: questionStub()[0],
//             submissions: new Map<string, Submission>(),
//         };
//         barChartServiceSpy.updateBarChartData(mockElement);
//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(mockBarChart);
//     });

//     it('should not update barChartData when given a bad clientId and submission', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         const mockElement = { clientId: 'someClientId', submission: undefined as unknown as Submission };
//         const mockBarChart: BarChartData = {
//             question: questionStub()[0],
//             submissions: new Map<string, Submission>(),
//         };
//         barChartServiceSpy.updateBarChartData(mockElement);
//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(mockBarChart);
//     });

//     it('should not duplicate submissions when player toggles different choices one after the other', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         const mockElement1 = { clientId: 'someClientId', submission: submissionStub()[0] };
//         const mockElement2 = { clientId: 'someClientId', submission: submissionStub()[1] };
//         const mockElement3 = { clientId: 'someClientId', submission: submissionStub()[2] };
//         const mockBarChart: BarChartData = {
//             question: questionStub()[0],
//             submissions: new Map<string, Submission>([[mockElement3.clientId, mockElement3.submission]]),
//         };
//         barChartServiceSpy.updateBarChartData(mockElement1);
//         barChartServiceSpy.updateBarChartData(mockElement2);
//         barChartServiceSpy.updateBarChartData(mockElement3);

//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(mockBarChart);
//     });

//     it('should contain multiple players submissions', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         const mockElement1 = { clientId: 'someClientId', submission: submissionStub()[0] };
//         const mockElement2 = { clientId: 'someClientId2', submission: submissionStub()[1] };
//         const mockElement3 = { clientId: 'someClientId3', submission: submissionStub()[2] };
//         const mockBarChart: BarChartData = {
//             question: questionStub()[0],
//             submissions: new Map<string, Submission>([
//                 [mockElement1.clientId, mockElement1.submission],
//                 [mockElement2.clientId, mockElement2.submission],
//                 [mockElement3.clientId, mockElement3.submission],
//             ]),
//         };
//         barChartServiceSpy.updateBarChartData(mockElement1);
//         barChartServiceSpy.updateBarChartData(mockElement2);
//         barChartServiceSpy.updateBarChartData(mockElement3);

//         expect(barChartServiceSpy.getCurrentQuestionData()).toEqual(mockBarChart);
//     });

//     it('should contain multiple barCharts', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         barChartServiceSpy.addQuestion(questionStub()[1]);

//         const mockBarChartContainer: BarChartData[] = [
//             {
//                 question: questionStub()[0],
//                 submissions: new Map<string, Submission>(),
//             },
//             {
//                 question: questionStub()[1],
//                 submissions: new Map<string, Submission>(),
//             },
//         ];
//         expect(barChartServiceSpy.getAllBarChart()).toEqual(mockBarChartContainer);
//     });

//     it('should update last barChart when logging new submissions', () => {
//         barChartServiceSpy.addQuestion(questionStub()[0]);
//         barChartServiceSpy.addQuestion(questionStub()[1]);

//         const mockElement1 = { clientId: 'someClientId', submission: submissionStub()[0] };

//         barChartServiceSpy.updateBarChartData(mockElement1);

//         const mockBarChartContainer: BarChartData[] = [
//             {
//                 question: questionStub()[0],
//                 submissions: new Map<string, Submission>(),
//             },
//             {
//                 question: questionStub()[1],
//                 submissions: new Map<string, Submission>([[mockElement1.clientId, mockElement1.submission]]),
//             },
//         ];
//         expect(barChartServiceSpy.getAllBarChart()).toEqual(mockBarChartContainer);
//     });
// });
