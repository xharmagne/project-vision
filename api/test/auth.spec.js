import app from '../bin/server';
import supertest from 'supertest';
import models from '../src/models';
import config from '../config';
import jwt from 'jsonwebtoken';
import { expect, should } from 'chai';
import { authUser, resetDB } from './utils';

should();
const request = supertest.agent(app.listen());
const context = {};

describe('Auth', () => {
  before(async () => {
    await resetDB();
    const r = await authUser(request);
    context.user = r.user;
    context.token = r.token;
  });

  describe('POST /auth', () => {
    it('should throw 401 if credentials are incorrect', done => {
      request
        .post('/auth')
        .set('Accept', 'application/json')
        .send({
          username: 'test@bank1.com',
          password: 'wrongpassword',
        })
        .expect(401, done);
    });

    it('should auth user', done => {
      request
        .post('/auth')
        .set('Accept', 'application/json')
        .send({ username: 'test@bank1.com', password: 'pass' })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          const user = jwt.verify(res.text, config.token);
          user.should.have.property('username');
          user.username.should.equal('test@bank1.com');
          expect(user.password).to.not.exist;

          context.user = user;
          context.token = res.text;

          done();
        });
    });
  });

  describe('GET /accounts', () => {
    it('should give ether balance', done => {
      request
        .get('/accounts')
        .set('Authorization', 'Bearer ' + context.token)
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.have.property('address');
          done();
        });
    });
  });
});
