import { BadRequestException } from '@nestjs/common';

export class IncorrectEmailCodeException extends BadRequestException {
  constructor() {
    super('IncorrectEmailCode');
  }
}
