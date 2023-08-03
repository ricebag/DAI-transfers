export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    pass: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    name: process.env.DB_NAME,
  },
  infuraApiKey: process.env.INFURA_API_KEY,
});
