import express, { Request, Response } from 'express';
import { userDb } from '../../../database';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  //Check for user
  try {
    const checkUserQuery = `SELECT * FROM users WHERE username = $1`;
    const { rows: users } = await userDb.query(checkUserQuery, [username]);
    if (users.length === 0) {
      res.status(200).send({ error: 'Username not found' });
      return;
    }
    const isValidPassword = bcrypt.compareSync(
      password,
      users[0].password_hash
    );
    if (!isValidPassword) {
      res.status(200).send({ error: 'Invalid password' });
      return;
    }
    //Create JWT
    const {accessToken, refreshToken} = generateTokens(users[0].id);
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      username: users[0].username,
      email: users[0].email,
      firstName: users[0].first_name,
      lastName: users[0].last_name,
    });
  } catch (e) {
    console.error(e);
    res.status(200).send({ error: 'An error occurred' });
  }
});

export default router;
