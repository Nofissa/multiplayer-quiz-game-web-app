const serveurUrl = 'http://ec2-15-157-59-57.ca-central-1.compute.amazonaws.com';
const serverPort = 3000;

export const environment = {
    production: false,
    serverUrl: `${serveurUrl}:${serverPort}`,
    apiUrl: `${serveurUrl}:${serverPort}/api`,
};
