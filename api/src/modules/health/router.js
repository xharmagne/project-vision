import * as controller from './controller';

export const baseUrl = '/health';

export default [
  {
    method: 'GET',
    route: '/',
    handlers: [controller.health],
  },
];
