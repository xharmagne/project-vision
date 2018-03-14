import app from '../bin/server';
import supertest from 'supertest';
import { expect, should } from 'chai';
import { resetDB } from './utils';
import uuid from 'node-uuid';

should();
const request = supertest.agent(app.listen());
const context = {};

describe('Users', () => {
  before(done => {
    resetDB().then(() => done());
  });

  describe('POST /users', () => {
    it('should reject signup when data is incomplete', done => {
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send({ username: 'supercoolname@bank1.com' })
        .expect(422, done);
    });

    it('should sign up', done => {
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send({
          username: 'supercoolname@bank1.com',
          password: 'supersecretpassword',
          role: 'bank',
          fullName: 'Bank 1',
          contactNumber: '0433000000',
        })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.have.property('invitationCode');
          expect(res.body.password).to.not.exist;
          expect(res.body.token).to.not.exist;
          context.invitationCode = res.body.invitationCode;
          done();
        });
    });
  });

  describe('GET /invitation', () => {
    it('should fail on invalid invitation code', done => {
      const invitationCode = '1234';
      request
        .get(`/auth/invite/${invitationCode}`)
        .set('Accept', 'application/json')
        .send({ password: 'passowrd' })
        .expect(422, done);
    });

    it('should fail on invalid invitation code', done => {
      const invitationCode = uuid.v1();
      request
        .get(`/auth/invite/${invitationCode}`)
        .set('Accept', 'application/json')
        .send({ password: 'passowrd' })
        .expect(404, done);
    });

    it('should return user profile on valid invitation code', done => {
      const { invitationCode } = context;
      request
        .get(`/auth/invite/${invitationCode}`)
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.have.property('username');
          done();
        });
    });
  });

  describe('POST /invitation', () => {
    it('should fail on invalid invitation code', done => {
      const invitationCode = uuid.v1();
      request
        .post(`/auth/invite/${invitationCode}`)
        .set('Accept', 'application/json')
        .send({ password: 'passowrd' })
        .expect(404, done);
    });

    it('should set user password', done => {
      const { invitationCode } = context;
      request
        .post(`/auth/invite/${invitationCode}`)
        .set('Accept', 'application/json')
        .send({ password: 'passowrd' })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.have.property('token');
          res.body.user.should.have.property('username');
          context.user = res.body.user;
          context.token = res.body.token;
          done();
        });
    });
  });

  describe('GET /users', () => {
    it('should get all users', done => {
      const { invitationCode } = context;
      request
        .get('/users')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`,
        })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.have.length(1);
          done();
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should not fetch user if token is invalid', done => {
      request
        .get('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1',
        })
        .expect(401, done);
    });

    it('should not fetch user if token is invalid', done => {
      request
        .get('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer1',
        })
        .expect(401, done);
    });

    it('should not fetch user if token is invalid', done => {
      request
        .get('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Dummy 1',
        })
        .expect(401, done);
    });

    it("should throw 404 if user doesn't exist", done => {
      const { token } = context;
      request
        .get('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        })
        .expect(404, done);
    });

    it('should fetch user', done => {
      const { user: { id }, token } = context;

      request
        .get(`/users/${id}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.password).to.not.exist;
          done();
        });
    });
  });

  describe('PUT /users/:id', () => {
    it('should not update user if token is invalid', done => {
      request
        .put('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1',
        })
        .expect(401, done);
    });

    it("should throw 404 if user doesn't exist", done => {
      const { token } = context;
      request
        .put('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        })
        .expect(404, done);
    });

    it('should update user', done => {
      const { user: { id }, token } = context;

      request
        .put(`/users/${id}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        })
        .send({ username: 'updatedcoolname' })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.have.property('username');
          res.body.username.should.equal('updatedcoolname');
          expect(res.body.password).to.not.exist;

          done();
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should not delete user if token is invalid', done => {
      request
        .delete('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1',
        })
        .expect(401, done);
    });

    it("should throw 404 if user doesn't exist", done => {
      const { token } = context;
      request
        .delete('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        })
        .expect(404, done);
    });

    it('should delete user', done => {
      const { user: { id }, token } = context;

      request
        .delete(`/users/${id}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        })
        .expect(200, done);
    });
  });
});
