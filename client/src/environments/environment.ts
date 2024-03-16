const serveurUrl = 'http://localhost';
const serverPort = 3000;

export const environment = {
    production: false,
    serverUrl: `${serveurUrl}:${serverPort}`,
    apiUrl: `${serveurUrl}:${serverPort}/api`,
};
