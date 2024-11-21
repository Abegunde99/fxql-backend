/* eslint-disable prettier/prettier */
export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
      url: process.env.DATABASE_URL,
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  });