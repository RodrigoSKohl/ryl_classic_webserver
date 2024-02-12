// models/connnect.js
const mssql = require('mssql');
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: process.env.LOCAL_DEV === 'true'
  },
};

const pool = new mssql.ConnectionPool(dbConfig);

module.exports = {
  pool,
  mssql,
};