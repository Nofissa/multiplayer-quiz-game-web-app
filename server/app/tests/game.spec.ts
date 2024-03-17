/* eslint-disable @typescript-eslint/no-explicit-any */
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
        quiz = quizStub(); // Mock quiz object
        organizer = { id: 'organizerId' } as any; // Mock organizer socket
        game = new Game('PIN123', quiz, organizer);
    });

    it('should create a game with default state Opened', () => {
        expect(game.pin).toBe('PIN123');
        expect(game.quiz).toBe(quiz);
        expect(game.organizer).toBe(organizer);
        expect(game.state).toBe(GameState.Opened);
    });

    it('should load the next question and initialize a new submission map', () => {
        game.loadNextQuestion();
        expect(game.questionSubmissions.length).toEqual(2);
        expect(game.questionSubmissions[1].size).toEqual(0);
        expect(game.currentQuestionIndex).toEqual(1);
    });

    it('should get the current question', () => {
        quiz.questions = [questionStub()[0], questionStub()[1]];
        expect(game.currentQuestion).toEqual(questionStub()[0]);
        game.loadNextQuestion();
        expect(game.currentQuestion).toEqual(questionStub()[1]);
    });

    it('should return questionSubmission with the right index', () => {
        expect(game.questionSubmissions).toEqual([new Map()]);
    });

    it('allSubmission should return questionSubmission', () => {
        expect(game.allSubmissions).toEqual([new Map()]);
    });

    it('current question Submission should return the right map', () => {
        expect(game.currentQuestionSubmissions).toEqual(new Map());
    });
});
