import { UserCredentialSet } from '@common/user-credential-set';

export const goodUserCredentialStub = (): UserCredentialSet => {
    return {
        username: 'Admin',
        password: 'log2990-206',
    };
};

export const badUserCredentialStub = (): UserCredentialSet => {
    return {
        username: 'User',
        password: 'password',
    };
};
