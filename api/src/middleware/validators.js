import { verify } from 'jsonwebtoken';
import models from '../models';
import config from '../../config';
import { getToken } from '../utils/auth';
import { find, includes } from 'lodash';
import { roles } from '../models/user';

const { Key, User } = models;

export function ensureUser(authRoles = []) {
  return async function(ctx, next) {
    const token = getToken(ctx);

    if (!token) {
      ctx.throw(401);
    }

    let decoded = null;
    try {
      decoded = verify(token, config.token);
    } catch (err) {
      console.error(err);
      ctx.throw(401);
    }

    const user = await User.findOne({
      where: {
        id: decoded.id,
      },
      include: {
        model: Key,
      },
    });

    if (!user) {
      ctx.throw(401);
    }

    ctx.state.user = user;

    // Ensure roles match.
    const authorized = includes(authRoles, roles.ANYONE)
      ? true
      : !!find(
          authRoles,
          role => user.role && user.role.toLowerCase() === role.toLowerCase()
        );

    if (!authorized) {
      ctx.throw(401);
    }

    return next();
  };
}
