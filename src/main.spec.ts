const listen = jest.fn(() => Promise.resolve());
const create = jest.fn(() => ({ listen }));

import { AppModule } from './app.module';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create,
  },
}));
jest.mock('./app.module');

describe('Main', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create Nest application and listen on port 3000', async () => {
    await bootstrap();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NestFactory } = require('@nestjs/core');

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);

    expect(listen).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledWith(3000);
  });
});
