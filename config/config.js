require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: 'naufal',
    database: 'retribusi_sampah_db',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
require('dotenv').config(); // PENTING: Biar bisa baca file .env

    module.exports = {
      development: {
        username: "postgres",
        password: "naufal",
        database: "retribusi_sampah_db",
        host: "localhost",
        port: "5432",
        dialect: "postgres"
      },

      test: {
        username: 'postgres',
        password: 'naufal',
        database: 'retribusi_sampah_test',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres'
  test: {
          username: "postgres",
          password: "naufal",
          database: "retribusi_sampah_test",
          host: "localhost",
          port: "5432",
          dialect: "postgres"
        },

        production: {
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          dialect: 'postgres',
          logging: false
        }
      };
    };
