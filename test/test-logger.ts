import { Logger, LoggerService } from '@nestjs/common';

export class TestLogger extends Logger implements LoggerService {
  log(message: string) {
    //
  }
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
  }
  warn(message: string) {
    //
  }
  debug(message: string) {
    //
  }
  verbose(message: string) {
    //
  }
}
