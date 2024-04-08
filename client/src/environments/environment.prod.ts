const serverUrl = 'http://ec2-15-157-59-57.ca-central-1.compute.amazonaws.com';
const serverPort = 3000;

export const environment = {
    production: true,
    serverUrl: `${serverUrl}:${serverPort}`,
    apiUrl: `${serverUrl}:${serverPort}/api`,
};
