import app from '../bin/server';
import supertest from 'supertest';
import { expect, should } from 'chai';
import { authUser, resetDB } from './utils';

should();
const request = supertest.agent(app.listen());
const context = {};

describe('Contracts', () => {
  before(async () => {
    await resetDB();
    const r = await authUser(request);
    context.user = r.user;
    context.token = r.token;
  });

  describe('GET /contracts', () => {
    it('should return all contracts', done => {
      request
        .get('/contracts')
        .set('Authorization', 'Bearer ' + context.token)
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.have.length(2);
          done();
        });
    });
  });
});
