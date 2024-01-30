import { Question } from '@app/model/database/question';
import { UpsertQuestionDto } from '@app/model/dto/question/upsert-question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @ApiOkResponse({
        description: 'Returns all questions',
        type: Question,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getAllQuestions(@Res() response: Response) {
        try {
            const allQuestions: Question[] = await this.questionService.getAllQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new question',
    })
    @Post('/')
    async addQuestion(@Body() dto: UpsertQuestionDto, @Res() response: Response) {
        try {
            const addedQuestion: Question = await this.questionService.addQuestion(dto);
            response.status(HttpStatus.CREATED).json(addedQuestion);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Update a question',
        type: Question,
    })
    @Put('/')
    async updateQuestion(@Body() dto: UpsertQuestionDto, @Res() response: Response) {
        try {
            const updatedQuestion: Question = await this.questionService.updateQuestion(dto);
            response.status(HttpStatus.OK).json(updatedQuestion);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a question',
    })
    @Delete('/:id')
    async deleteQuestionById(@Param('id') id: string, @Res() response: Response) {
        try {
            const question: Question = await this.questionService.deleteQuestionById(id);
            response.status(HttpStatus.OK).json(question);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }
}
