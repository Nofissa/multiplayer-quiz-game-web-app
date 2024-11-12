import { IEnvironment } from './ienvironment';
import { DEV_ENVIRONMENT } from '@app/constants/dev-environment';

export const environment: IEnvironment = {
    production: false,
    serverPort: DEV_ENVIRONMENT.serverPort,
    serverUrl: `${DEV_ENVIRONMENT.serverUrl}:${DEV_ENVIRONMENT.serverPort}`,
    apiUrl: `${DEV_ENVIRONMENT.serverUrl}:${DEV_ENVIRONMENT.serverPort}/api`,
    panicAudioSrc: 'assets/ticking-timer.wav',
};
