import { AuthPayload } from '@common/auth-payload';
import { UserCredentialSet } from '@common/user-credential-set';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { readFileSync } from 'fs';

const usersFilePath = 'assets/users.json';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    @ApiOkResponse({
        description: 'Returns a JWT upon successful authentication',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/login')
    async login(@Body() credSet: UserCredentialSet, @Res() response: Response) {
        try {
            const credSets: UserCredentialSet[] = JSON.parse(readFileSync(usersFilePath).toString());
            const matchingCredentialSet = credSets.find((x) => {
                return x.username === credSet.username && x.password === credSet.password;
            });

            if (!matchingCredentialSet) {
                throw new Error('Invalid credentials');
            }

            const payload: AuthPayload = {
                token: sign({}, process.env.PRIVATE_RSA_KEY, { expiresIn: '6h', algorithm: 'RS256' }),
            };

            response.status(HttpStatus.OK).json(payload);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns true if the token is valid, false otherwise',
    })
    @Post('/verify')
    async verifyToken(@Body() payload: AuthPayload, @Res() response: Response) {
        try {
            const token = payload.token;
            if (!token) {
                throw new Error('Token not provided');
            }

            verify(token, process.env.PUBLIC_RSA_KEY);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
