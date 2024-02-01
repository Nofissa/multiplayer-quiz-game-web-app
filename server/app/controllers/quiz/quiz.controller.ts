import { Course } from '@app/model/database/course';
import { Question, Quiz } from '@app/model/database/quiz';
import { UpsertQuizDto } from '@app/model/dto/quiz/upsert-quiz.dto';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Quiz')
@Controller('quizzes')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @ApiOkResponse({
        description: 'Returns quizzes',
        type: Course,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getAllQuizzes(@Res() response: Response) {
        try {
            const allQuiz = await this.quizService.getAllQuizzes();
            response.status(HttpStatus.OK).json(allQuiz);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new question',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addQuiz(@Body() dto: UpsertQuizDto, @Res() response: Response) {
        try {
            await this.quizService.addQuiz(dto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a quiz',
        type: Course,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/')
    async modifyQuiz(@Body() dto: UpsertQuizDto, @Res() response: Response) {
        try {
            const quiz: Quiz = await this.quizService.modifyQuiz(dto);
            response.status(HttpStatus.OK).json(quiz);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a question in a quiz',
        type: Course,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/:id/questions/:questionId')
    async modifyQuestionInQuiz(@Param('id') quizId: string, @Param('questionId') questionId: string, @Res() response: Response) {
        try {
            const question: Question = await this.quizService.modifyQuestionInQuiz(quizId, questionId);
            response.status(HttpStatus.OK).json(question);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a question in a quiz ',
        type: Course,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id/questions/:questionId')
    async deleteQuestionInQuiz(@Param('id') quizId: string, @Param('questionId') questionId: string, @Res() response: Response) {
        try {
            const question: Question = await this.quizService.deleteQuestionInQuizbyId(quizId, questionId);
            response.status(HttpStatus.OK).json(question);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a quiz',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteQuizById(@Param('id') id: string, @Res() response: Response) {
        try {
            const quiz: Quiz = await this.quizService.deleteQuizById(id);
            response.status(HttpStatus.OK).json(quiz);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }
}
