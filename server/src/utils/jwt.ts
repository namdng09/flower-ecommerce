import jwt from 'jsonwebtoken';

export const generateToken = (user: {
  id: string;
  role: string;
}): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    {
      expiresIn: '15m'
    }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_secret',
    {
      expiresIn: '7d'
    }
  );
  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): string | jwt.JwtPayload => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'your_jwt_secret'
    );
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Invalid token');
  }
};
