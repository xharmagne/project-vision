import * as controller from './controller';
import { ensureUser } from '../../middleware/validators';
import { roles } from '../../models/user';

export const baseUrl = '/contracts';

export default [
  {
    method: 'GET',
    route: '/',
    handlers: [ensureUser([roles.ANYONE]), controller.getContracts],
  },
];
