import { GameEventPayload } from '@common/game-event-payload';
import { applyIfPinMatches } from './conditional-applications';

describe('applyIfPinMatches', () => {
    it('should apply the function if the pin matches', () => {
        const pin = '1234';
        const payload: GameEventPayload<number> = { pin: '1234', data: 42 };
        const callback = jasmine.createSpy('callback');

        const func = applyIfPinMatches(pin, callback);
        func(payload);

        expect(callback).toHaveBeenCalledWith(payload.data);
    });

    it('should not apply the function if the pin does not match', () => {
        const pin = '1234';
        const payload: GameEventPayload<number> = { pin: '5678', data: 42 };
        const callback = jasmine.createSpy('callback');

        const func = applyIfPinMatches(pin, callback);
        func(payload);

        expect(callback).not.toHaveBeenCalled();
    });
});
