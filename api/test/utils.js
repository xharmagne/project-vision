import models from '../src/models';
import faker from 'faker';

export async function resetDB() {
  const { User } = models;
  await User.destroy({ truncate: true, cascade: true });

  return;
}

export function sleep(t) {
  return new Promise((resolve, reject) => setTimeout(resolve, t));
}

async function authProfile(profile, agent) {
  const res = await agent
    .post('/users')
    .set('Accept', 'application/json')
    .send(profile);

  const obj = JSON.parse(res.text);

  const ret = await agent
    .post(`/auth/invite/${obj.invitationCode}`)
    .set('Accept', 'application/json')
    .send({
      password: 'pass',
    });

  return ret.body;
}

export function authUser(agent) {
  return authProfile(
    {
      username: 'test@bank1.com',
      password: 'pass',
      role: 'bank',
      fullName: 'Test',
      contactNumber: '0433000000',
    },
    agent
  );
}
