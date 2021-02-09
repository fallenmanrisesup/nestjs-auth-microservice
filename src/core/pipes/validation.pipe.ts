import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

export interface ValidationErrorMessage {
  property: string;
  constraints: string[];
  parent?: string;
}

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors: ValidationError[] = await validate(object);

    const mapErrors: (
      arr: ValidationError[],
      parent?: string,
    ) => ValidationErrorMessage[] = (arr, parent?) =>
      arr.reduce<ValidationErrorMessage[]>(
        (prev, { property, constraints, children }) => {
          if (constraints) {
            prev.push({
              property,
              constraints: Object.values(constraints),
              parent,
            });
          } else {
            prev.push(...mapErrors(children, property));
          }
          return prev;
        },
        [],
      );

    const mappedErrors = mapErrors(errors);

    if (errors.length > 0) {
      throw new HttpErrorByCode[HttpStatus.UNPROCESSABLE_ENTITY](mappedErrors);
    }

    return value;
  }

  private shouldValidate(metatype) {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
