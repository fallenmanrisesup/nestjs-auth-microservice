import { UserInputError } from 'apollo-server-express';

export class UserNotFoundException extends UserInputError {
  constructor(id: string) {
    super('User Not Found', { id });
  }
}
