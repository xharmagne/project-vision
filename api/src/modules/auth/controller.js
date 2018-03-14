import Joi from 'joi';
import passport from 'koa-passport';
import { omitSecrets } from '../../utils/auth';
import { registerRole } from '../../services/userService';
import config from '../../../config';
import models from '../../models';
import moment from 'moment';
import {
  getBalance,
  addEther,
  waitForReceipt,
  decodeLogs,
} from '../../services/ethersjs';

const { Key, User, sequelize } = models;

/**
 * @apiDefine TokenError
 * @apiError Unauthorized Invalid JWT token
 *
 * @apiErrorExample {json} Unauthorized-Error:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": 401,
 *       "error": "Unauthorized"
 *     }
 */

/**
 * @api {post} /auth Authenticate user
 * @apiVersion 1.0.0
 * @apiName AuthUser
 * @apiGroup Auth
 *
 * @apiParam {String} username  User username.
 * @apiParam {String} password  User password.
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "username": "johndoe@gmail.com", "password": "foo" }' localhost:5000/auth
 *
 * @apiSuccess {Object}   user           User object
 * @apiSuccess {ObjectId} user._id       User id
 * @apiSuccess {String}   user.name      User name
 * @apiSuccess {String}   user.username  User username
 * @apiSuccess {String}   token          Encoded JWT
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "username": "johndoe"
 *        },
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
 *     }
 *
 * @apiError Unauthorized Incorrect credentials
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": 401,
 *       "error": "Unauthorized"
 *     }
 */

export async function authUser(ctx, next) {
  return await passport.authenticate('local', async user => {
    if (!user) {
      ctx.throw(401);
    }
    const token = user.generateToken();
    user.update({ lastLogin: moment().toISOString() });

    //top-up user's ether balance if required
    const currentEtherBalance = await getBalance(user.id);
    const minEther = config.etherTopup;
    if (currentEtherBalance < minEther) {
      addEther(user.id, minEther - currentEtherBalance);
    }

    ctx.body = token;
  })(ctx, next);
}

/**
 * @api {get} /auth/invite/:id Get user by invitation code
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName Invite
 * @apiGroup Auth
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/auth/invite/56bd1da600a526986cf65c80
 *
 * @apiSuccess {Object}   users           User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         ...user object
 *     }
 *
 * @apiUse TokenError
 */
export async function validateInvite(ctx) {
  const user = ctx.state.user;
  ctx.body = omitSecrets(user);
}

/**
 * @api {POST} /auth/invite/:id Sets user's password based on invitation code
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName ConfirmUser
 * @apiGroup Auth
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST localhost:5000/auth/invite/56bd1da600a526986cf65c80
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": { ... },
 *       "token": "valid.jwt.token"
 *     }
 *
 * @apiUse TokenError
 */
export async function confirmUser(ctx) {
  const user = ctx.state.user;

  const transactionHash = await registerRole(user.id, user.role);

  const transactionReceipt = await waitForReceipt(transactionHash);
  const decodedLogs = decodeLogs(transactionReceipt);

  const eventData = decodedLogs.find(o => {
    return o.event == 'RegisterRole';
  }).args;

  await sequelize.transaction(async function(t) {
    await user.update(
      {
        role: eventData.role,
        password: ctx.request.body.password,
        invitationCode: null,
      },
      {
        transaction: t,
      }
    );
  });

  // Re-load user instance to get the full balance.
  await user.reload();
  const token = user.generateToken();

  ctx.status = 200;
  ctx.body = {
    user: omitSecrets(user),
    token,
  };
}

export async function userIdValidation(ctx, next) {
  const schema = Joi.string().guid({ version: ['uuidv1'] });

  Joi.validate(
    ctx.params.id,
    schema,
    {
      abortEarly: false,
    },
    (err, value) => {
      if (err) {
        console.error(err.details);
        ctx.throw(422, JSON.stringify(err.details));
      }
    }
  );

  const user = await User.findOne({
    where: {
      invitationCode: ctx.params.id,
    },
  });

  if (user) {
    ctx.state.user = user;
  } else {
    ctx.throw(404, 'No user corresponding to ref number');
  }

  if (next) {
    return next();
  }
}
