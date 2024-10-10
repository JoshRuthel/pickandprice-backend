import { Pool } from 'pg';

export const userDb = new Pool({
  user: 'postgres',
  host: 'host.docker.internal',
  database: 'picknprice-app',
  password: 'postgres',
  port: 5432,
});

export const productDb = new Pool({
  user: 'postgres',
  host: 'host.docker.internal',
  database: 'picknprice-scraper',
  password: 'postgres',
  port: 5432,
});