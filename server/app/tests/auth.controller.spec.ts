/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthController } from '@app/controllers/auth/auth.controller';
import { AuthService } from '@app/services/auth/auth.service';
import { AuthPayload } from '@common/auth-payload';
import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { badUserCredentialStub, goodUserCredentialStub } from './stubs/user.credential.stub';

describe('AuthController', () => {
    let authControllerTest: AuthController;
    let authServiceTest: SinonStubbedInstance<AuthService>;

    beforeEach(async () => {
        authServiceTest = createStubInstance(AuthService);

        const moduleRef = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authServiceTest,
                },
            ],
        }).compile();

        authControllerTest = moduleRef.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(authControllerTest).toBeDefined();
    });

    describe('login()', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const goodPayloadMock: AuthPayload = {
            token: sign({}, process.env.PRIVATE_RSA_KEY, { algorithm: 'RS256' }),
        };

        it('should return 200 OK with good credential if auth succesfull', async () => {
            authServiceTest.authenticate.resolves(goodPayloadMock);
            await authControllerTest.login(goodUserCredentialStub(), mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(goodPayloadMock)).toBeTruthy();
        });

        it('should return 401 UNAUTHORIZED if auth not succesfull', async () => {
            authServiceTest.authenticate.rejects(goodPayloadMock);
            await authControllerTest.login(badUserCredentialStub(), mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.UNAUTHORIZED)).toBeTruthy();
            expect(mockResponse.send.calledWith('Unauthorized acces')).toBeTruthy();
        });
    });

    describe('verify()', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const goodPayloadMock: AuthPayload = {
            token: sign({}, process.env.PRIVATE_RSA_KEY, { algorithm: 'RS256' }),
        };

        it('should return 204 NO CONTENT if verification succesfull', async () => {
            authServiceTest.verifyAuth.resolves();
            await authControllerTest.verify(goodPayloadMock, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.NO_CONTENT)).toBeTruthy();
        });

        it('should return 401 UNAUTHORIZED if verification not succesfull', async () => {
            authServiceTest.verifyAuth.rejects();
            await authControllerTest.verify(goodPayloadMock, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.UNAUTHORIZED)).toBeTruthy();
            expect(mockResponse.send.calledWith('verification failed')).toBeTruthy();
        });
    });
});
