import { GameEventPayload } from '@common/game-event-payload';
import { pipe } from 'fp-ts/function';
import { filter, fromNullable, map } from 'fp-ts/Option';

const applyIf = <T>(predicate: (x: T) => boolean, func: (x: T) => void): ((x: T) => void) => {
    return (x: T) => {
        pipe(fromNullable(x), filter(predicate), map(func));
    };
};

export const applyIfPinMatches = <T>(pin: string, func: (payload: T) => void): ((data: GameEventPayload<T>) => void) => {
    return applyIf(
        (payload: GameEventPayload<T>) => payload.pin === pin,
        (payload: GameEventPayload<T>) => func(payload.data),
    );
};
