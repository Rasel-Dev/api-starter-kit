import { verifyToken } from '@/libs';
import { RequestHandler } from 'express';

export const isAuth: RequestHandler = async (req, res, next) => {
  let token =
    req.body?.token ||
    req.query?.token ||
    req.headers['authorization'] ||
    req.headers['x-access-token'];

  if (!token) {
    res.status(403).send('Unauthorized!');
    return;
  }
  if (token.toLowerCase().startsWith('bearer')) {
    token = token.slice('bearer'.length).trim();
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded.aud;
  } catch (err) {
    res.status(401).send('Invalid Token');
    return;
  }
  next();
};
