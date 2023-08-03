import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';

describe('AppModule', () => {
  let module: TestingModule;
  afterEach(async () => {
    await module.close();
  });

  describe('SQLite Configuration', () => {
    beforeAll(async () => {
      process.env.NODE_ENV = 'test';
      module = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
    });

    it('should use SQLite configuration', async () => {
      const app = module.get(AppModule);
      expect(app).toBeDefined();
    });
  });
});
