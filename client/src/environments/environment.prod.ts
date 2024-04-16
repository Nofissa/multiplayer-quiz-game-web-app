import { IEnvironment } from './ienvironment';
import { PROD_ENVIRONMENT } from '@app/constants/prod-environment';

export const environment: IEnvironment = {
    production: true,
    serverPort: PROD_ENVIRONMENT.serverPort,
    serverUrl: `${PROD_ENVIRONMENT.serverUrl}:${PROD_ENVIRONMENT.serverPort}`,
    apiUrl: `${PROD_ENVIRONMENT.serverUrl}:${PROD_ENVIRONMENT.serverPort}/api`,
    panicAudioSrc: 'https://imed-bennour.github.io/sound-for-LOG2990/ticking-timer.wav',
};
