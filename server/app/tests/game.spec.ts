/* eslint-disable no-underscore-dangle */ // disabled for MongoDB _id fields
/* eslint-disable @typescript-eslint/no-explicit-any */ // useful especially for the socket mocking
import { Game } from '@app/classes/game';
import { Quiz } from '@app/model/database/quiz';
import { GameState } from '@common/game-state';
import { Socket } from 'socket.io';
import { questionStub } from './stubs/question.stubs';
import { quizStub } from './stubs/quiz.stubs';

describe('Game', () => {
    let game: Game;
    let quiz: Quiz;
    let organizer: Socket;

    beforeEach(() => {
        quiz = quizStub();
        organizer = { id: 'organizerId' } as any;
        game = new Game('PIN123', quiz, organizer);
    });

    it('should create a game with default state Opened', () => {
        expect(game.pin).toBe('PIN123');
        expect(game.quiz).toBe(quiz);
        expect(game.organizer).toBe(organizer);
        expect(game.state).toBe(GameState.Opened);
    });

    it('should return null if this.currentQuestionIndex >= this.quiz.questions.length', () => {
        game.currentQuestionIndex = 5;
        expect(game.currentQuestion).toBeNull();
    });

    it('should load the next question and initialize a new submission map', () => {
        game.loadNextQuestion();
        expect(game.qrlSubmissions.length).toEqual(2);
        expect(game.qrlSubmissions[1].size).toEqual(0);
        expect(game.currentQuestionIndex).toEqual(1);
    });

    it('should get the current question', () => {
        quiz.questions = [questionStub()[0], questionStub()[1]];
        expect(game.currentQuestion).toEqual(questionStub()[0]);
        game.loadNextQuestion();
        expect(game.currentQuestion).toEqual(questionStub()[1]);
    });

    it('should return questionSubmission with the right index', () => {
        expect(game.qrlSubmissions).toEqual([new Map()]);
    });

    it('allSubmission should return questionSubmission', () => {
        expect(game.qcmSubmissions).toEqual([new Map()]);
    });

    it('current question Submission should return the right map', () => {
        expect(game.currentQuestionQcmSubmissions).toEqual(new Map());
    });

    it('should return the current question QRL submissions map', () => {
        expect(game.currentQuestionQrlSubmissions).toEqual(new Map());
    });

    it('should return the current question QRL evaluations map', () => {
        expect(game.currentQuestionQrlEvaluations).toEqual(new Map());
    });

    it('should be random if the quiz _id is not defined', () => {
        game.quiz._id = undefined;
        expect(game.isRandom).toBe(true);
    });

    it('should not be random if the quiz _id is defined', () => {
        game.quiz._id = 'someId';
        expect(game.isRandom).toBe(false);
    });

    it('should return the highest score among players', () => {
        const highestScore = game.getHighestScore();
        expect(highestScore).toEqual(-Infinity);
    });

    it('should return the active players', () => {
        const activePlayer = game.getActivePlayers();
        expect(activePlayer).toEqual([]);
    });
});
