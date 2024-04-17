import { PROD_ENVIRONMENT } from '@app/constants/prod-environment';
import { IEnvironment } from './ienvironment';

export const environment: IEnvironment = {
    production: true,
    serverPort: PROD_ENVIRONMENT.serverPort,
    serverUrl: `${PROD_ENVIRONMENT.serverUrl}:${PROD_ENVIRONMENT.serverPort}`,
    apiUrl: `${PROD_ENVIRONMENT.serverUrl}:${PROD_ENVIRONMENT.serverPort}/api`,
    panicAudioSrc: 'https://imed-bennour.github.io/logo-for-game-log2990/ticking-timer.wav',
};
