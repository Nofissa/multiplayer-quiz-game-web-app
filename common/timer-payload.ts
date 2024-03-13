import { TimerEventType } from "./timer-event-type";

export interface TimerPayload {
    remainingTime: number;
    eventType: TimerEventType;
}
