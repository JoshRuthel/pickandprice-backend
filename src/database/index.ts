import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs'
import path from 'path'
dotenv.config()


export const db = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 25060,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, '../../ca-certificate.crt'))
  }
});

// export const db = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "do-pickandprice-local",
//   password: "postgres",
//   port: 5432,
// });