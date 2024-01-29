import { Component, OnInit } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http.service';

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.scss'],
})
export class QuizListComponent implements OnInit {
    quizzes: Quiz[] = [];

    constructor(private readonly quizHttpService: QuizHttpService) {}

    ngOnInit() {
        this.fetchQuizzes();
        this.fetchQuizzes();
        this.fetchQuizzes();
        this.fetchQuizzes();
    }

    private fetchQuizzes() {
        const quiz1: Quiz = {
            titre: 'General Knowledge Quiz',
            description: 'Test your general knowledge with these questions.',
            questions: [
                {
                    question: 'What is the capital of France?',
                    incorrectAnswers: ['Berlin', 'Madrid', 'Rome'],
                    correctAnswer: 'Paris',
                    lastModified: new Date(),
                    _id: 'question1_id',
                },
                {
                    question: 'Which planet is known as the Red Planet?',
                    incorrectAnswers: ['Venus', 'Jupiter', 'Saturn'],
                    correctAnswer: 'Mars',
                    lastModified: new Date(),
                    _id: 'question2_id',
                },
                // Add more questions as needed
            ],
            isHidden: false,
            lastModified: new Date(),
            _id: 'quiz1_id',
        };

        this.quizzes.push(quiz1);

        const quiz2: Quiz = {
            titre: 'Science Quiz',
            description: 'Test your knowledge in science and technology.',
            questions: [
                {
                    question: 'What is the chemical symbol for water?',
                    incorrectAnswers: ['CO2', 'O2', 'CH4'],
                    correctAnswer: 'H2O',
                    lastModified: new Date(),
                    _id: 'question1_id',
                },
                {
                    question: 'Who developed the theory of relativity?',
                    incorrectAnswers: ['Isaac Newton', 'Galileo Galilei', 'Stephen Hawking'],
                    correctAnswer: 'Albert Einstein',
                    lastModified: new Date(),
                    _id: 'question2_id',
                },
                // Add more questions as needed
            ],
            isHidden: true,
            lastModified: new Date(),
            _id: 'quiz2_id',
        };

        this.quizzes.push(quiz2);

        const quiz3: Quiz = {
            titre: 'Programming Concepts Quiz',
            description: 'Test your understanding of programming concepts.',
            questions: [
                {
                    question: 'What is the purpose of a loop in programming?',
                    incorrectAnswers: ['To create a variable', 'To define a function', 'To perform arithmetic operations'],
                    correctAnswer: 'To repeat a block of code',
                    lastModified: new Date(),
                    _id: 'question1_id',
                },
                {
                    question: 'What does the acronym HTML stand for?',
                    incorrectAnswers: ['High-Level Text Management Language', 'HyperLink and Text Markup Language', 'Home Tool Markup Language'],
                    correctAnswer: 'HyperText Markup Language',
                    lastModified: new Date(),
                    _id: 'question2_id',
                },
                // Add more questions as needed
            ],
            isHidden: false,
            lastModified: new Date(),
            _id: 'quiz3_id',
        };

        this.quizzes.push(quiz3);

        this.quizHttpService.getAllQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
        });
    }
}
