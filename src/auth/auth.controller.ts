import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Ip } from '../core/decorators/ip.decorator';
import { IJwtClaims } from '../jwt/interfaces/jwt-claims';
import { Claims } from '../core/decorators/claims.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RestAuthGuard } from './guards/rest-auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ValidationPipe } from '../core/pipes/validation.pipe';
import { ISessionMeta } from './intrafeces/session-meta';
import { RecoverPasswordDto } from './dtos/recover-password.dto';
import { RecoverPasswordConfirmDto } from './dtos/recover-password-confirm.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/respondent')
  async respondent(@Headers() headers, @Ip() ip) {
    return this.authService.respondentAuth(
      headers['User-Agent'],
      ip,
      headers['Device-Token'],
    );
  }

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

  @UseGuards(RestAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/logout')
  async logout(
    @Claims('http') jwtClaims: IJwtClaims,
    @Body() { deviceToken, agent }: ISessionMeta,
  ) {
    await this.authService.logout({ userId: jwtClaims.id, deviceToken, agent });
  }

  @Post('/password-recovery/')
  async passwordRecovery(@Body() body: RecoverPasswordDto) {
    await this.authService.recoverPassword(body);
  }

  @Post('/password-recovery/confirm')
  async passwordRecoveryConfirm(@Body() body: RecoverPasswordConfirmDto) {
    return this.authService.recoverPasswordConfirm(body);
  }

  @UseGuards(RestAuthGuard)
  @Post('/password-reset')
  async passwordReset(
    @Claims('http') jwtClaims: IJwtClaims,
    @Body() body: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(jwtClaims, body);
  }
}
