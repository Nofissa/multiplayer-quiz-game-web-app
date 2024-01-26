import { Course } from '@app/model/database/course';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';
import { QuizService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuizService) {}

    @ApiOkResponse({
        description: 'Returns all questions',
        type: Course,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getAllQuestions(@Res() response: Response) {
        try {
            const allQuestions = await this.questionService.getAllQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
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
    async addQuestion(@Body() dto: CreateQuestionDto, @Res() response: Response) {
        try {
            await this.questionService.addQuestion(dto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a question',
        type: Course,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/')
    async modifyQuestion(@Body() dto: UpdateQuestionDto, @Res() response: Response) {
        try {
            await this.questionService.modifyQuestion(dto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a question',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteQuestionById(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.questionService.deleteQuestionById(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
