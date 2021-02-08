import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { Ip } from '../core/decorators/ip.decorator';
import { IJwtClaims } from 'src/jwt/interfaces/jwt-claims';
import { Claims } from '../core/decorators/claims.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: LoginDto, @Ip() ip: string) {
    console.log(body);
    const result = await this.authService.login({ ...body, ip });
    return result;
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    await this.authService.register(body);
  }

  @Patch('/refresh')
  async refresh() {}

  @Get('/me')
  async me(@Claims() jwtClaims: IJwtClaims) {
    return jwtClaims;
  }

  @Get('/test')
  async test() {
    return this.authService.test();
  }
}
