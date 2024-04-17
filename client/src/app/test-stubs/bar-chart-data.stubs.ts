import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarchartElement } from '@app/interfaces/barchart-element';
import { BarchartSubmission } from '@common/barchart-submission';
import { BarChartType } from '@common/barchart-type';
import { firstPlayerStub, secondPlayerStub } from './player.stubs';
import { qcmQuestionStub, qrlQuestionStub } from './question.stubs';

const mockQuestionElements0: BarchartElement[] = [];
qcmQuestionStub()[0].choices?.forEach((choice) => {
    mockQuestionElements0.push({ text: choice.text, isCorrect: choice.isCorrect });
});

const mockQuestionElements1: BarchartElement[] = [];
qcmQuestionStub()[1].choices?.forEach((choice) => {
    mockQuestionElements1.push({ text: choice.text, isCorrect: choice.isCorrect });
});

export const barchartSubmissionStubs = (): BarchartSubmission[][] => {
    return [
        [
            { clientId: firstPlayerStub().socketId, index: 0, isSelected: true },
            { clientId: firstPlayerStub().socketId, index: 1, isSelected: false },
            { clientId: firstPlayerStub().socketId, index: 2, isSelected: true },
            { clientId: firstPlayerStub().socketId, index: 3, isSelected: true },
            { clientId: secondPlayerStub().socketId, index: 0, isSelected: true },
            { clientId: secondPlayerStub().socketId, index: 1, isSelected: false },
            { clientId: secondPlayerStub().socketId, index: 2, isSelected: false },
            { clientId: secondPlayerStub().socketId, index: 3, isSelected: true },
        ],
        [
            { clientId: firstPlayerStub().socketId, index: 0, isSelected: true },
            { clientId: firstPlayerStub().socketId, index: 1, isSelected: false },
            { clientId: firstPlayerStub().socketId, index: 2, isSelected: false },
            { clientId: firstPlayerStub().socketId, index: 3, isSelected: false },
            { clientId: secondPlayerStub().socketId, index: 0, isSelected: true },
            { clientId: secondPlayerStub().socketId, index: 1, isSelected: false },
            { clientId: secondPlayerStub().socketId, index: 2, isSelected: true },
            { clientId: secondPlayerStub().socketId, index: 3, isSelected: false },
        ],
        [
            { clientId: firstPlayerStub().socketId, index: 0, isSelected: true },
            { clientId: secondPlayerStub().socketId, index: 1, isSelected: true },
        ],
        [
            { clientId: firstPlayerStub().socketId, index: 2, isSelected: true },
            { clientId: secondPlayerStub().socketId, index: 0, isSelected: true },
        ],
    ];
};

export const barChartDataStub = (): BarChartData[] => {
    return [
        {
            text: qcmQuestionStub()[0].text,
            chartElements: mockQuestionElements0,
            chartType: BarChartType.QCM,
            submissions: barchartSubmissionStubs()[0],
        },
        {
            text: qcmQuestionStub()[1].text,
            chartElements: mockQuestionElements1,
            chartType: BarChartType.QCM,
            submissions: barchartSubmissionStubs()[1],
        },
        {
            text: qrlQuestionStub()[0].text,
            chartElements: [{ text: '0' }, { text: '50' }, { text: '100' }],
            chartType: BarChartType.QRL,
            submissions: barchartSubmissionStubs()[2],
        },
        {
            text: qrlQuestionStub()[1].text,
            chartElements: [{ text: '0' }, { text: '50' }, { text: '100' }],
            chartType: BarChartType.QRL,
            submissions: barchartSubmissionStubs()[3],
        },
        {
            text: 'stuff',
            chartElements: [{ text: 'inactif' }, { text: 'actif' }],
            chartType: BarChartType.ACTIVITY,
            submissions: [
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
            ],
        },
    ];
};
