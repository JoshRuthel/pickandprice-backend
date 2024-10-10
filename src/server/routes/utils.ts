import jwt from 'jsonwebtoken';

const secret = process.env.REACT_APP_JWT_SECRET || 'secret';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refreshSecret';

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, secret, {
    expiresIn: '15min',
  }); 
  const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: '2h' });
  return { accessToken, refreshToken };
}

export function verifyJwt(refreshToken: string) {
  jwt.verify(refreshToken, secret, async (err, user) => {
    if (err || !user) return { error: 'Invalid token' };
    if (typeof user === 'string') return { error: 'Something went wrong' };
    const { userId } = user;

    const accessToken = jwt.sign({ userId }, secret, {
      expiresIn: '15min',
    });
    return { accessToken };
  });
}
