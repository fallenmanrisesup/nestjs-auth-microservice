import { NotFoundException } from '@nestjs/common';

export class NoSmsTokenException extends NotFoundException {
  constructor() {
    super('No sms token found or it is expired');
  }
}
