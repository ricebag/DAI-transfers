import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import fs from 'fs';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const databaseName = 'db/tests/sqlite';

  const removeDb = () => {
    try {
      if (fs.existsSync(databaseName)) {
        fs.unlinkSync(databaseName);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createTestDataSet = async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(databaseName);

    db.run(`INSERT INTO black_list
    (id, walletAddress)
    VALUES
    (1, 'walletAddress1'),
    (2, 'walletAddress2'),
    (3, 'walletAddress3')
    `);

    db.run(`INSERT INTO transfer
    (id, block, amount, sender, reciever, date)
    VALUES
    (1, 1000, 1000, 'senderAddress1', 'recieverAddress1', 2023-07-17),
    (2, 2000, 2000, 'senderAddress2', 'recieverAddress2', 2023-07-17),
    (3, 3000, 3000, 'senderAddress3', 'recieverAddress3', 2023-07-17),
    (4, 4000, 4000, 'walletAddress1', 'recieverAddress4', 2023-07-17),
    (5, 5000, 5000, 'senderAddress5', 'walletAddress1', 2023-07-17)
    `);
  };

  beforeAll(async () => {
    await removeDb();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await createTestDataSet();
  });

  afterAll(async () => {
    await Promise.all([app.close(), removeDb()]);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('BlackList', () => {
    it('/ (GET)', async () => {
      return request(app.getHttpServer())
        .get('/blacklist')
        .expect(200)
        .expect([
          { id: 1, walletAddress: 'walletAddress1' },
          { id: 2, walletAddress: 'walletAddress2' },
          { id: 3, walletAddress: 'walletAddress3' },
        ]);
    });

    it('/:id (GET)', () => {
      return request(app.getHttpServer())
        .get('/blacklist/1')
        .expect(200)
        .expect({
          id: 1,
          walletAddress: 'walletAddress1',
        });
    });

    describe('/ (POST)', () => {
      it('Unauthorised request', () => {
        return request(app.getHttpServer())
          .post('/blacklist')
          .send({ id: 'BanThisWallet' })
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Basic Auth credentials not provided.',
            error: 'Unauthorized',
          });
      });

      it('Authorised request', () => {
        return request(app.getHttpServer())
          .post('/blacklist')
          .auth('admin', 'pass')
          .send({ id: 'BanThisWallet' })
          .expect(201)
          .expect('The wallet address "BanThisWallet" has been blacklisted');
      });
    });
  });

  describe('Transfers', () => {
    it('/ (GET) should return transfers from non blacklisted wallets', () => {
      return request(app.getHttpServer())
        .get('/transfer')
        .expect(200)
        .expect([
          { sender: 'senderAddress3', total_amount: 3000 },
          { sender: 'senderAddress2', total_amount: 2000 },
          { sender: 'senderAddress1', total_amount: 1000 },
        ]);
    });

    describe('/:id (GET)', () => {
      it('Should throw an error when an invalid id is provided', () => {
        return request(app.getHttpServer())
          .get('/transfer/10000000')
          .expect(500)
          .expect({ statusCode: 500, message: 'Internal server error' });
      });

      it('Should return the document if it exists', () => {
        return request(app.getHttpServer())
          .get('/transfer/1')
          .expect(200)
          .expect({
            id: 1,
            block: 1000,
            amount: '1000',
            sender: 'senderAddress1',
            reciever: 'recieverAddress1',
            date: 1999,
          });
      });
    });
  });
});
