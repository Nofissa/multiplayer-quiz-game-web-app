import { Question } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';
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
            response.status(HttpStatus.NOT_FOUND).send('Cannot find questions');
        }
    }

    @ApiCreatedResponse({
        description: 'Adds a new question',
        type: Question,
    })
    @Post('/')
    async addQuestion(@Body() dto: QuestionDto, @Res() response: Response) {
        try {
            const addedQuestion: Question = await this.questionService.addQuestion(dto);
            response.status(HttpStatus.CREATED).json(addedQuestion);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send('Cannot add question');
        }
    }

    @ApiOkResponse({
        description: 'Updates a question',
        type: Question,
    })
    @Put('/')
    async updateQuestion(@Body() dto: QuestionDto, @Res() response: Response) {
        try {
            const updatedQuestion: Question = await this.questionService.updateQuestion(dto);
            response.status(HttpStatus.OK).json(updatedQuestion);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send('Error while updating question');
        }
    }

    @ApiOkResponse({
        description: 'Deletes a question',
    })
    @Delete('/:id')
    async deleteQuestionById(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.questionService.deleteQuestionById(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Cant find question to delete');
        }
    }
}
