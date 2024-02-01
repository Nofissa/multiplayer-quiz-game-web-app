import { AuthPayload } from '@common/auth-payload';
import { UserCredentialSet } from '@common/user-credential-set';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '@app/services/auth/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOkResponse({
        description: 'Returns a JWT upon successful authentication',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/login')
    async login(@Body() userCredentialSet: UserCredentialSet, @Res() response: Response) {
        try {
            const payload = await this.authService.authenticate(userCredentialSet);
            response.status(HttpStatus.OK).json(payload);
        } catch (error) {
            response.status(HttpStatus.UNAUTHORIZED).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns true if the token is valid, false otherwise',
    })
    @Post('/verify')
    async verify(@Body() payload: AuthPayload, @Res() response: Response) {
        try {
            await this.authService.verifyAuth(payload);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
