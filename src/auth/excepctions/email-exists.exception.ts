import { BadRequestException } from '@nestjs/common';

export class EmailExistsException extends BadRequestException {
  constructor() {
    super('User with such email or username already exists');
  }
}
