import models from '../../models';
import { blockNumber } from '../../services/ethersjs';
const { Contract } = models;

/**
 * @api {get} /health checks if node is connected
 * @apiName health
 * @apiGroup health
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/health
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiErrorExample
 *     HTTP/1.1 500
 */
export async function health(ctx) {
  const number = await blockNumber();

  if (!number) {
    ctx.throw(500, `Failed to connect to Blockchain node`);
  }

  const contracts = await Contract.findAll();
  if (contracts.length === 0) {
    ctx.throw(500, `Failed to connect to Database`);
  }

  ctx.status = 204;
}
