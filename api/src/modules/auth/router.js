import * as auth from './controller';

export const baseUrl = '/auth';

export default [
  {
    method: 'POST',
    route: '/',
    handlers: [auth.authUser],
  },
  {
    method: 'GET',
    route: '/invite/:id',
    handlers: [auth.userIdValidation, auth.validateInvite],
  },
  {
    method: 'POST',
    route: '/invite/:id',
    handlers: [auth.userIdValidation, auth.confirmUser],
  },
];
