import { BadRequestException } from '@nestjs/common';

export class BadRefreshTokenException extends BadRequestException {
  constructor() {
    super('Bad refresh token');
  }
}
