import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  public error: any;

  constructor(err) {
    super('Validation Error', HttpStatus.UNPROCESSABLE_ENTITY);
    this.error = err;
  }
}
