import { Quiz } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common';
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
                response.status(HttpStatus.NOT_FOUND).send("Can't find quiz");
            }
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Error while getting the quiz');
        }
    }

    @ApiCreatedResponse({
        description: 'Create a new quiz',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('/')
    async addQuiz(@Body() dto: QuizDto, @Res() response: Response) {
        try {
            const createdQuiz = await this.quizService.addQuiz(dto);
            response.status(HttpStatus.CREATED).json(createdQuiz);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send("Can't add quiz");
        }
    }

    @ApiOkResponse({
        description: 'Update or insert a quiz',
        type: Quiz,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/')
    async upsertQuiz(@Body() dto: QuizDto, @Res() response: Response) {
        try {
            const quiz: Quiz = await this.quizService.upsertQuiz(dto);
            response.status(HttpStatus.OK).json(quiz);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send("Can't find quiz to modify");
        }
    }

    @ApiOkResponse({
        description: 'Toggle the visibility of a quiz',
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
            response.status(HttpStatus.NOT_FOUND).send("Can't find quiz to hide");
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
            response.status(HttpStatus.NOT_FOUND).send("Can't find quiz to delete");
        }
    }
}
