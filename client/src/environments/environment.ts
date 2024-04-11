const serverUrl = 'http://localhost';
const serverPort = 3000;

export const environment = {
    production: false,
    serverUrl: `${serverUrl}:${serverPort}`,
    apiUrl: `${serverUrl}:${serverPort}/api`,
};
