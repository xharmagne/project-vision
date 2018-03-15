import { getAccount } from './accountService';

export function score(tx) {
  const from = getAccount(tx.from);
  const to = getAccount(tx.to);

  return from.score === 1 || to.score === 1 ? 1 : 0;
}
