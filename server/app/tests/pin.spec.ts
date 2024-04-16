import { generateRandomPin } from '@app/helpers/pin';

describe('generateRandomPin', () => {
    it('should generate a random pin with the correct length and format', () => {
        const PIN_LENGTH = 4;
        const pin = generateRandomPin();

        // Check if the pin matches the pattern with the exact good length
        expect(pin.length).toEqual(PIN_LENGTH);
        expect(new RegExp(`^[0-9]{${PIN_LENGTH}}$`).test(pin)).toBe(true);
    });
});
