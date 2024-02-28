const MAX_PIN_NO = 10000;
const PADDING = 4;

export const generateRandomPin = (): string => {
    const randomNumber = Math.floor(Math.random() * MAX_PIN_NO);

    const randomString = randomNumber.toString().padStart(PADDING, '0');

    return randomString;
};
