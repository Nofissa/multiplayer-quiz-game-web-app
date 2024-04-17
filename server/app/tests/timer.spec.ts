/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { Timer } from '@app/classes/timer';
import { Subscription } from 'rxjs';

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

            expect(() => timer.setTicksPerSecond(negativeValue)).toThrow();
            expect(() => timer.setTicksPerSecond(zeroValue)).toThrowError();
        });

        it('should not throw an error for a tick per second value greater than 0', () => {
            const positiveValue = 1;

            expect(() => timer.setTicksPerSecond(positiveValue)).not.toThrow();
        });

        it('should restart the timer if tickPerSecond is positive and the timer is running', () => {
            const intervalMs = 1000;
            const ticksPerSecond = 5;
            timer['interval'] = setInterval(() => {
                return;
            }, intervalMs);
            jest.spyOn(timer, 'isRunning', 'get').mockReturnValue(true);
            const restartSpy = jest.spyOn(timer, 'restart');

            timer.setTicksPerSecond(ticksPerSecond);

            expect(restartSpy).toHaveBeenCalled();

            restartSpy.mockRestore();
        });
    });

    describe('pause', () => {
        it('should clear the interval', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            timer.start();
            const clone = timer['interval'];
            timer.pause();

            expect(clearIntervalSpy).toHaveBeenCalledWith(clone);
            clearIntervalSpy.mockRestore();
        });
    });

    describe('restart', () => {
        it('should clear the interval and start again if the interval exists', () => {
            jest.useFakeTimers();
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            const startSpy = jest.spyOn(timer, 'start');
            jest.spyOn(timer, 'isRunning', 'get').mockReturnValue(false);

            const intervalMs = 1000;

            timer['interval'] = setInterval(() => {
                return;
            }, intervalMs);

            timer.restart();

            expect(clearIntervalSpy).toHaveBeenCalled();

            clearIntervalSpy.mockRestore();
            startSpy.mockRestore();
        });
    });

    describe('onTick', () => {
        it('should unsubscribe if subscription exists', () => {
            timer['tickSubscription'] = new Subscription();
            const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

            timer.onTick(jest.fn());

            expect(unsubscribeSpy).toHaveBeenCalled();
        });

        it('should not unsubscribe if no subscription exists', () => {
            timer['tickSubscription'] = null;
            const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

            timer.onTick(jest.fn());

            expect(unsubscribeSpy).toHaveBeenCalledTimes(0);
        });
    });

    describe('isRunning', () => {
        it('should return false if no interval or interval destroyed', () => {
            expect(timer.isRunning).toBe(false);

            timer.start();

            expect(timer.isRunning).toBe(true);

            timer.pause();

            expect(timer.isRunning).toBe(false);
        });
    });
});
