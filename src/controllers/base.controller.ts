import { verifyToken } from '@/libs';
import { NextFunction, Request, Response, Router } from 'express';

export default abstract class BaseController {
  protected router: Router;

  constructor() {
    this.router = Router();
  }
  /**
   * To enforce use this configureRoutes method for child classes
   */
  abstract configureRoutes(): void;

  public getRouter() {
    return this.router;
  }
  /**
   * Show all registered routes within inherited controller
   */
  protected _showRoutes() {
    let routePaths = [];
    this.router.stack.forEach((stack: any) => {
      routePaths.push({
        controller: this.constructor.name,
        path: stack.route?.path,
        method: (stack.route?.stack[0]?.method).toUpperCase(),
      });
    });
    console.table(routePaths, ['controller', 'method', 'path']);
  }

  protected isAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
}
