import { NotFoundException } from '@nestjs/common';

export class IncorrectCredentialsException extends NotFoundException {
  constructor() {
    super('Incorrect credentials');
  }
}
