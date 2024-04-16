import { TimerEventType } from './timer-event-type';

export interface StartTimerPayload {
    pin: string;
    eventType: TimerEventType;
    duration?: number;
}
