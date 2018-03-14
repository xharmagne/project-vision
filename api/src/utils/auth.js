import { isFunction, omit } from 'lodash';

export function getToken(ctx) {
  const header = ctx.request.header.authorization;
  if (!header) {
    return null;
  }
  const parts = header.split(' ');
  if (parts.length !== 2) {
    return null;
  }
  const scheme = parts[0];
  const token = parts[1];
  if (/^Bearer$/i.test(scheme)) {
    return token;
  }
  return null;
}

export function omitSecrets(user, fields = []) {
  if (isFunction(user.toJSON)) {
    user = user.toJSON();
  }

  return omit(user, fields.concat(['password', 'keyAddress', 'key_address']));
}
