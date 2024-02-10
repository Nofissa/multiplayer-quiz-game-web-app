import { Quiz } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Quiz')
@Controller('quizzes')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @ApiOkResponse({
        description: 'Returns all quizzes',
        type: Quiz,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getQuizzes(@Res() response: Response, @Query('visibleOnly') visibleOnly?: boolean) {
        try {
            const quizzes = await this.quizService.getQuizzes(visibleOnly);
            response.status(HttpStatus.OK).json(quizzes);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Quizzes not found');
        }
    }

    @ApiOkResponse({
        description: 'Returns a quiz',
        type: Quiz,
    })
    @ApiNotFoundResponse({
        description: 'Returns NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async getQuizById(@Param('id') id: string, @Res() response: Response, @Query('visibleOnly') visibleOnly?: boolean) {
        try {
            const quiz = await this.quizService.getQuizById(id, visibleOnly);

            if (quiz) {
                response.status(HttpStatus.OK).json(quiz);
            } else {
                response.status(HttpStatus.NOT_FOUND).send();
            }
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
    async addQuiz(@Body() dto: QuizDto, @Res() response: Response) {
        try {
            const createdQuiz = await this.quizService.addQuiz(dto);
            response.status(HttpStatus.CREATED).json(createdQuiz);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send('Cant add quiz');
        }
    }

    @ApiOkResponse({
        description: 'Modify a quiz',
        type: Quiz,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/')
    async modifyQuiz(@Body() dto: QuizDto, @Res() response: Response) {
        try {
            const quiz: Quiz = await this.quizService.modifyQuiz(dto);
            response.status(HttpStatus.OK).json(quiz);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Cant find quiz to modify');
        }
    }

    @ApiOkResponse({
        description: 'Toggle the hidden state of quiz',
        type: Quiz,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Patch('/hide/:id')
    async hideQuizById(@Param('id') id: string, @Res() response: Response) {
        try {
            const quiz: Quiz = await this.quizService.hideQuizById(id);
            response.status(HttpStatus.OK).json(quiz);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Cant find quiz to hide');
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
            await this.quizService.deleteQuizById(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Cant find quiz to delete');
        }
    }
}
