import { Injectable } from '@nestjs/common';
import { UserCredentialSet } from '@common/user-credential-set';
import { sign, verify } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { AuthPayload } from '@common/auth-payload';

const usersFilePath = 'assets/users.json';

@Injectable()
export class AuthService {
    async authenticate(userCredentialSet: UserCredentialSet): Promise<AuthPayload> {
        try {
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
        } catch (error) {
            return Promise.reject(`Failed to authenticate: ${error}`);
        }
    }

    async verifyAuth(payload: AuthPayload): Promise<void> {
        try {
            const token = payload.token;
            if (!token) {
                Promise.reject('No token in payload');
            }

            verify(token, process.env.PUBLIC_RSA_KEY);
        } catch (error) {
            return Promise.reject(`Failed to verify token: ${error}`);
        }
    }
}
