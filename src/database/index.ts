import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config()


export const db = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});