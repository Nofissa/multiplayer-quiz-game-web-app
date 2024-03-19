import { generateRandomPin } from '@app/helpers/pin';

describe('generateRandomPin', () => {
    it('should generate a random pin with the correct length and format', () => {
        const MAX_PIN = 10000;
        const PIN_LENGTH = 4;
        const pin = generateRandomPin();

        // Check if the pin has the correct length
        expect(pin.length).toBe(PIN_LENGTH); // Assuming PADDING is set to 4

        // Check if the pin consists of only numeric characters
        expect(/^[0-9]+$/.test(pin)).toBe(true);

        // Check if the pin is within the expected range
        const pinNumber = parseInt(pin, 10);
        expect(pinNumber).toBeGreaterThanOrEqual(0);
        expect(pinNumber).toBeLessThan(MAX_PIN); // Assuming MAX_PIN_NO is set to 10000
    });
});
