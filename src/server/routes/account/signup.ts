import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../../database';
import { v4 as uuid } from 'uuid';
import { generateTokens } from '../utils';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { firstName, lastName, username, password } = req.body;
  try {
    // Check if username or email exists
    const checkUserQuery = `SELECT * FROM users WHERE username = $1`;
    const { rows: users } = await db.query(checkUserQuery, [username]);
    if (users.length > 0) {
      res.status(200).send({ error: `Username already exists` });
      return;
    }
    // Save user to database
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuid();
    const insertUserQuery = `INSERT INTO users (id, first_name, last_name, username, password_hash) VALUES ($1, $2, $3, $4, $5)`;
    await db.query(insertUserQuery, [
      id,
      firstName,
      lastName,
      username,
      passwordHash,
    ]);
    //Generate JWT
    const {accessToken, refreshToken} = generateTokens(id);
    res.json({
      message: 'Signup successful',
      accessToken,
      refreshToken,
      username,
      firstName,
      lastName,
      userId: id
    });

  } catch (e) {
    console.error(e);
    res.status(200).send({ error: 'An error occurred' });
  }
});

export default router;
