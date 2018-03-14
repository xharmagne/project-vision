import models from '../../models';
import { getBalance } from '../../services/ethersjs';
const { Key, User } = models;

/**
 * @api {get} /accounts gets balance and public key of a user
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName accounts
 * @apiGroup Accounts
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/accounts
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       address: 0x5d38fd27a567bb64da18b3b9640e25eaf4d10f3c,
 *       balance: 500000
 *     }
 *
 * @apiUse TokenError
 */
export async function getAccount(ctx) {
  const user = ctx.state.user;
  const balance = await getBalance(user.key.address);
  ctx.status = 200;
  ctx.body = { address: user.key.address, balance };
}
