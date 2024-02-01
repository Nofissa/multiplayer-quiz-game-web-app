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
            titre: 'Math Quiz',
            description: 'Test your math skills',
            questions: [
                {
                    _id: '1',
                    question: 'What is 5 + 7?',
                    incorrectAnswers: ['10', '12', '15'],
                    correctAnswers: ['12'],
                    pointValue: 1,
                    lastModified: new Date(),
                },
                {
                    _id: '2',
                    question: 'Solve for x: 2x - 8 = 10',
                    incorrectAnswers: ['3', '4', '6'],
                    correctAnswers: ['9'],
                    pointValue: 2,
                    lastModified: new Date(),
                },
            ],
            isHidden: false,
            lastModified: new Date(),
            _id: 'quiz123',
        };

        const quiz2: Quiz = {
            titre: 'Science Quiz',
            description: 'Test your science knowledge',
            questions: [
                {
                    _id: '3',
                    question: 'What is the chemical symbol for water?',
                    incorrectAnswers: ['H2O', 'CO2', 'O2'],
                    correctAnswers: ['H2O'],
                    pointValue: 1,
                    lastModified: new Date(),
                },
                {
                    _id: '4',
                    question: 'Who developed the theory of relativity?',
                    incorrectAnswers: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei'],
                    correctAnswers: ['Albert Einstein'],
                    pointValue: 2,
                    lastModified: new Date(),
                },
            ],
            isHidden: true,
            lastModified: new Date(),
            _id: 'quiz456',
        };

        const quiz3: Quiz = {
            titre: 'History Quiz',
            description: 'Test your knowledge of historical events',
            questions: [
                {
                    _id: '5',
                    question: 'In which year did World War II end?',
                    incorrectAnswers: ['1943', '1945', '1950'],
                    correctAnswers: ['1945'],
                    pointValue: 1,
                    lastModified: new Date(),
                },
                {
                    _id: '6',
                    question: 'Who was the first President of the United States?',
                    incorrectAnswers: ['Thomas Jefferson', 'George Washington', 'John Adams'],
                    correctAnswers: ['George Washington'],
                    pointValue: 2,
                    lastModified: new Date(),
                },
            ],
            isHidden: false,
            lastModified: new Date(),
            _id: 'quiz789',
        };

        console.log(quiz1);
        console.log(quiz2);
        console.log(quiz3);

        this.quizzes.push(quiz1);
        this.quizzes.push(quiz2);
        this.quizzes.push(quiz3);

        this.quizHttpService.getAllQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
        });
    }
}
