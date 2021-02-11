import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthConfirmationsService } from './auth-confirmations.service';
import { VerifyEmailDto } from './dtos/verify-email.dto';

@Controller('/auth-confirmations')
export class AuthConfirmationsController {
  constructor(
    private readonly authConfirmationsService: AuthConfirmationsService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authConfirmationsService.verifyEmail(body);
  }
}
