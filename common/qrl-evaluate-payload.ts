import { Grade } from './grade';

export interface QrlEvaluatePayload {
    socketId: string;
    pin: string;
    grade: Grade;
}
