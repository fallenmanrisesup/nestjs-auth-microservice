import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Ip } from '../core/decorators/ip.decorator';
import { IJwtClaims } from 'src/jwt/interfaces/jwt-claims';
import { Claims } from '../core/decorators/claims.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RestAuthGuard } from './guards/rest-auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ValidationPipe } from '../core/pipes/validation.pipe';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('/login')
  async login(@Body() body: LoginDto, @Ip() ip: string) {
    return this.authService.login({ ...body, ip });
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(ClassSerializerInterceptor)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Patch('/refresh')
  async refresh(@Body() body: RefreshTokenDto, @Ip() ip: string) {
    return this.authService.refresh(body.refreshToken, { ...body, ip });
  }

  @UseGuards(RestAuthGuard)
  @Get('/me')
  async me(@Claims('http') jwtClaims: IJwtClaims) {
    return jwtClaims;
  }
}
