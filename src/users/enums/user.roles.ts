import { registerEnumType } from '@nestjs/graphql';

export enum UserRoles {
  ADMIN = 'ADMIN',
  RESPONDENT = 'RESPONDENT',
  SITE_OWNER = 'SITE_OWNER',
}

registerEnumType(UserRoles, {
  name: 'UserRoles',
});
