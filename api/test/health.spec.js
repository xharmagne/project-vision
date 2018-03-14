import app from '../bin/server';
import supertest from 'supertest';
import { expect, should } from 'chai';
import sinon from 'sinon';
import * as ethersjs from '../src/services/ethersjs';

should();
const request = supertest.agent(app.listen());
const context = {};

describe('Health Check', () => {
  describe('GET /health', () => {
    it('should should for health check', done => {
      request.get('/health').expect(204, done);
    });

    it('should throw 500 if it cannot get block number', done => {
      const stub = sinon.stub(ethersjs, 'blockNumber').returns(null);
      request.get('/health').expect(500, (err, res) => {
        if (err) {
          return done(err);
        }
        stub.restore();
        done();
      });
    });
  });
});
