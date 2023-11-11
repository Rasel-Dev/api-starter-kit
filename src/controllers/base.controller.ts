import { verifyToken } from '@/libs';
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';

export default abstract class BaseController {
  public $router: Router;

  constructor() {
    this.$router = Router();
  }
  /**
   * To enforce use this configureRoutes method for child classes
   */
  abstract configureRoutes(): void;

  /**
   * HTTP methods
   */
  protected GET(path: string, ...handlers: RequestHandler<any>[]) {
    this.$router.get(path, handlers);
  }

  protected POST(path: string, ...handlers: RequestHandler<any>[]) {
    this.$router.post(path, handlers);
  }

  protected PUT(path: string, ...handlers: RequestHandler<any>[]) {
    this.$router.put(path, handlers);
  }

  protected PATCH(path: string, ...handlers: RequestHandler<any>[]) {
    this.$router.patch(path, handlers);
  }

  protected DELETE(path: string, ...handlers: RequestHandler<any>[]) {
    this.$router.delete(path, handlers);
  }

  /**
   * Show all registered routes within inherited controller
   */
  protected $showRoutes() {
    let routePaths = [];
    this.$router.stack.forEach((stack: any) => {
      routePaths.push({
        path: stack.route?.path,
        method: (stack.route?.stack[0]?.method).toUpperCase(),
        controller: this.constructor.name,
      });
    });
    console.table(routePaths, ['method', 'path', 'controller']);
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
