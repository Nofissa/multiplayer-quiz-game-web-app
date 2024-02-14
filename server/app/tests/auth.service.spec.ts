import { AuthService } from '@app/services/auth/auth.service';
import { AuthPayload } from '@common/auth-payload';
import { Test, TestingModule } from '@nestjs/testing';
import * as jsonwebtoken from 'jsonwebtoken';
import { badUserCredentialStub, goodUserCredentialStub } from './stubs/user.credential.stub';

describe('AuthService', () => {
    let authServiceTest: AuthService;
    const goodPayloadMock: AuthPayload = {
        token: jsonwebtoken.sign({}, process.env.PRIVATE_RSA_KEY, { algorithm: 'RS256' }),
    };

    const badPayloadMock: AuthPayload = {
        token: 'ashjsdfsdkgfwsd',
    };

    const nullTokenPayloadMock: AuthPayload = {
        token: null,
    };

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
        it('should return the right token if good credentials', async () => {
            expect(await authServiceTest.authenticate(goodUserCredentialStub())).toEqual(goodPayloadMock);
        });

        it('should reject if wrong credentials', async () => {
            await expect(authServiceTest.authenticate(badUserCredentialStub())).rejects.toMatch('Invalid credentials');
        });
    });

    describe('verifyAuth', () => {
        it('should not reject if good token', async () => {
            await expect(authServiceTest.verifyAuth(goodPayloadMock)).resolves.toBeUndefined();
        });

        it('should reject if bad token', async () => {
            await expect(authServiceTest.verifyAuth(badPayloadMock)).rejects.toThrow();
        });

        it('should reject if no token', async () => {
            await expect(authServiceTest.verifyAuth(nullTokenPayloadMock)).rejects.toMatch('No token in payload');
        });
    });
});
