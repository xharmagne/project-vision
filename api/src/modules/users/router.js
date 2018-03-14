import { ensureUser } from '../../middleware/validators';
import * as user from './controller';
import { roles } from '../../models/user';

export const baseUrl = '/users';

export default [
  {
    method: 'POST',
    route: '/',
    handlers: [user.createUserValidation, user.createUser],
  },
  {
    method: 'GET',
    route: '/',
    handlers: [ensureUser([roles.ANYONE]), user.getUsers],
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [ensureUser([roles.ANYONE]), user.getUser],
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [ensureUser([roles.ANYONE]), user.getUser, user.updateUser],
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [ensureUser([roles.ANYONE]), user.getUser, user.deleteUser],
  },
];
