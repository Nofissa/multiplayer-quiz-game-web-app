import { AuthPayload } from '@common/auth-payload';
import { UserCredentialSet } from '@common/user-credential-set';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { sign, verify } from 'jsonwebtoken';

const usersFilePath = 'assets/users.json';

@Injectable()
export class AuthService {
    async authenticate(userCredentialSet: UserCredentialSet): Promise<AuthPayload> {
        const userCredentialSets: UserCredentialSet[] = JSON.parse(readFileSync(usersFilePath).toString());
        const matchingCredentialSet: UserCredentialSet = userCredentialSets.find((x) => {
            return x.username === userCredentialSet.username && x.password === userCredentialSet.password;
        });

        if (!matchingCredentialSet) {
            return Promise.reject('Invalid credentials');
        }

        return {
            token: sign({}, process.env.PRIVATE_RSA_KEY, { algorithm: 'RS256' }),
        };
    }

    async verifyAuth(payload: AuthPayload): Promise<void> {
        const token = payload.token;
        if (!token) {
            return Promise.reject('No token in payload');
        }

        verify(token, process.env.PUBLIC_RSA_KEY);
    }
}
