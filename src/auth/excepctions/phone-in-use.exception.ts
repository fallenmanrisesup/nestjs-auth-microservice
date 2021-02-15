import { BadRequestException } from '@nestjs/common';

export class PhoneInUseException extends BadRequestException {
  constructor() {
    super('Phone number already in use');
  }
}
