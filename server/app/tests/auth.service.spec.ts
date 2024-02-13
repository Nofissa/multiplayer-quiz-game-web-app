import { AuthService } from '@app/services/auth/auth.service';
import { AuthPayload } from '@common/auth-payload';
import { Test, TestingModule } from '@nestjs/testing';
import * as jsonwebtoken from 'jsonwebtoken';
import { badUserCredentialStub, goodUserCredentialStub } from './stubs/user.credential.stub';

describe('AuthService', () => {
    let authServiceTest: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService],
        }).compile();

        authServiceTest = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(authServiceTest).toBeDefined();
    });

    describe('authenticate', () => {
        const goodPayloadMock: AuthPayload = {
            token: jsonwebtoken.sign({}, process.env.PRIVATE_RSA_KEY, { algorithm: 'RS256' }),
        };

        it('should return the right token if credentials validated', async () => {
            expect(await authServiceTest.authenticate(goodUserCredentialStub())).toEqual(goodPayloadMock);
        });

        it('should reject with "Invalid credentials" if wrong credentials', async () => {
            await expect(authServiceTest.authenticate(badUserCredentialStub())).rejects.toMatch('Invalid credentials');
        });
    });

    describe('verifyAuth()', () => {
        const goodPayloadMock: AuthPayload = {
            token: jsonwebtoken.sign({}, process.env.PRIVATE_RSA_KEY, { algorithm: 'RS256' }),
        };

        const badPayloadMock: AuthPayload = {
            token: null,
        };

        it('verify should be called with the right token if payload validated', async () => {
            jest.spyOn(jsonwebtoken, 'verify');
            await authServiceTest.verifyAuth(goodPayloadMock);
            expect(jsonwebtoken.verify).toHaveBeenCalledWith(goodPayloadMock.token, process.env.PUBLIC_RSA_KEY);
        });

        it('verify should reject if no token', async () => {
            await expect(authServiceTest.verifyAuth(badPayloadMock)).rejects.toMatch('No token in payload');
        });
    });
});
