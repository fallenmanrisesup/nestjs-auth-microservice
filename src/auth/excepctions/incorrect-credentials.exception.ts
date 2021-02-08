import { NotFoundException } from '@nestjs/common';

export class IncorrectCredentials extends NotFoundException {
  constructor() {
    super('Incorrect credentials');
  }
}
