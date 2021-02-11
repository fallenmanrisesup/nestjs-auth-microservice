import { BadRequestException } from '@nestjs/common';

export class IncorrectRecoveryCodeException extends BadRequestException {
  constructor() {
    super('IncorrectRecoveryCode');
  }
}
