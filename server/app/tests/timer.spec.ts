/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { Timer } from '@app/classes/timer';

describe('Timer', () => {
    let timer: Timer;

    beforeEach(async () => {
        timer = new Timer();
    });

    beforeAll((done) => {
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll((done) => {
        done();
    });

    it('should be defined', () => {
        expect(timer).toBeDefined();
    });

    describe('start', () => {
        it('should call decrement the number of seconds', () => {
            jest.useFakeTimers();
            const decrementSpy = jest.spyOn(timer as any, 'decrement');
            const TIME = 10;
            const ONE_SECOND_IN_MS = 1000;
            timer.time = TIME;
            timer.start();
            jest.advanceTimersByTime(TIME * ONE_SECOND_IN_MS);

            expect(decrementSpy).toHaveBeenCalledTimes(TIME);
        });
    });

    describe('setTickPerSecond', () => {
        it('should throw an error for a tick per second value less than or equal to 0', () => {
            const negativeValue = -1;
            const zeroValue = 0;

            expect(() => timer.setTickPerSecond(negativeValue)).toThrow();
            expect(() => timer.setTickPerSecond(zeroValue)).toThrowError();
        });

        it('should not throw an error for a tick per second value greater than 0', () => {
            const positiveValue = 1;

            expect(() => timer.setTickPerSecond(positiveValue)).not.toThrow();
        });
    });

    describe('pause', () => {
        it('should clear the interval', () => {
            jest.useFakeTimers();

            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            timer.start();
            timer.pause();

            jest.runOnlyPendingTimers();

            expect(clearIntervalSpy).toHaveBeenCalledWith(timer['interval']);
            clearIntervalSpy.mockRestore();
        });
    });
});
