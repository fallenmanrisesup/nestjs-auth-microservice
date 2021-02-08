import { BadRequestException } from '@nestjs/common';

export class InvalidJwtException extends BadRequestException {
  constructor() {
    super('Access token expired or incorrect');
  }
}
