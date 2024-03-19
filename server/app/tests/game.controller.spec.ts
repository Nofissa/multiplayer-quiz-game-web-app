/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameController } from '@app/controllers/game/game.controller';
import { GameService } from '@app/services/game/game.service';
import { GameSnapshot } from '@common/game-snapshot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { gameStub } from './stubs/game.stub';

describe('GameController', () => {
    let app: INestApplication;
    let gameServiceMock: Partial<GameService>;
    beforeEach(async () => {
        const gameTest = gameStub();
        gameServiceMock = {
            getGame: jest.fn().mockReturnValue(gameTest),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameServiceMock,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('GET /games/:pin/snapshot', () => {
        it('should return game snapshot if game is found', async () => {
            const game = gameStub();
            const snapshotTest: GameSnapshot = {
                chatlogs: game.chatlogs,
                players: Array.from(game.clientPlayers.values()).map((x) => x.player),
                state: game.state,
                currentQuestionIndex: game.currentQuestionIndex,
                quiz: {
                    _id: game.quiz._id,
                    id: game.quiz.id,
                    title: game.quiz.title,
                    description: game.quiz.description,
                    isHidden: game.quiz.isHidden,
                    duration: game.quiz.duration,
                    lastModification: game.quiz.lastModification,
                    questions: game.quiz.questions.map((x) => {
                        return {
                            _id: x._id,
                            type: x.type,
                            text: x.text,
                            points: x.points,
                            choices: x.choices,
                            lastModification: x.lastModification,
                        };
                    }),
                },
                questionSubmissions: game.questionSubmissions,
            };
            const response = await request(app.getHttpServer()).get('/games/mockPin/snapshot');
            expect(response.status).toBe(HttpStatus.OK);
            expect(JSON.stringify(response.body)).toEqual(JSON.stringify(snapshotTest));
        });
    });

    it('should return NOT_FOUND status if game is not found', async () => {
        gameServiceMock.getGame = jest.fn().mockImplementation(() => {
            throw new Error('Game not found');
        });

        const response = await request(app.getHttpServer()).get('/games/nonExistentPin/snapshot');

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.text).toBe('Cannot find game');
    });
});
