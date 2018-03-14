import { ensureUser } from '../../middleware/validators';
import * as intelligence from './controller';
import { roles } from '../../models/user';

export const baseUrl = '/intelligence';

export default [
  {
    method: 'GET',
    route: '/relationships/:transactionId',
    handlers: [intelligence.getRelationships],
  },
  {
    method: 'GET',
    route: '/score',
    handlers: [intelligence.calculateScore],
  },
  {
    method: 'POST',
    route: '/score',
    handlers: [intelligence.calculateScore],
  },
];
