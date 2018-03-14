import models from '../../models';
const { Contract } = models;

export async function getContracts(ctx) {
  const contracts = await Contract.findAll();
  ctx.status = 200;
  ctx.body = contracts;
}
