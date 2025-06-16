import request from 'supertest';
import { expect } from 'chai';
import dotenv from 'dotenv';
dotenv.config();

import appModule from '../server.js';
const app = appModule.default || appModule;

describe('Auth /login', function () {
  this.timeout(5000);

  const { TEST_EMAIL, TEST_PASSWORD } = process.env;

  it('успешный логин → 200 и cookie', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).to.equal(200);
    expect(res.headers['set-cookie'], 'cookie не установлена').to.exist;
  });

  it('неправильный пароль → 401/400', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: 'wrong_pass' });

    expect([400, 401]).to.include(res.status);
  });
});
