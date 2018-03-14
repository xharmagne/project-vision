import { ensureUser } from '../../middleware/validators';
import * as account from './controller';
import { roles } from '../../models/user';

export const baseUrl = '/accounts';

export default [
  {
    method: 'GET',
    route: '/',
    handlers: [ensureUser([roles.ANYONE]), account.getAccount],
  },
];
