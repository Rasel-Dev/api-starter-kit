import { RequestHandler } from 'express';

export const exampleMiddleware: RequestHandler = (_req, _res, next) => {
  console.log('Middleware called');
  // throw new Error('Not Found!')
  next();
};
