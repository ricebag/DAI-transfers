import config from './config';

describe('config', () => {
  it('should have the correct variables set', () => {
    process.env = {
      PORT: '4000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_PASSWORD: 'testpass',
      DB_USER: 'testuser',
      DB_NAME: 'testdb',
    };

    const configuration = config();
    expect(configuration.port).toBe(4000);
    expect(configuration.database.host).toBe('localhost');
    expect(configuration.database.port).toBe(5432);
    expect(configuration.database.pass).toBe('testpass');
    expect(configuration.database.user).toBe('testuser');
    expect(configuration.database.name).toBe('testdb');
  });

  it('should default variables if no env vars are set', () => {
    process.env = {
      PORT: '',
      DB_HOST: '',
      DB_PORT: '',
      DB_PASSWORD: '',
      DB_USER: '',
      DB_NAME: '',
    };

    const configuration = config();
    expect(configuration.port).toBe(3000);
    expect(configuration.database.host).toBe('');
    expect(configuration.database.port).toBe(5432);
    expect(configuration.database.pass).toBe('');
    expect(configuration.database.user).toBe('');
    expect(configuration.database.name).toBe('');
  });
});
