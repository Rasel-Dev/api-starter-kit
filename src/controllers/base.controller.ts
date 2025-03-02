import { verifyToken } from '@/libs';
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';

// export default abstract class BaseController {
//   public $router: Router;

//   constructor() {
//     this.$router = Router();
//   }
//   /**
//    * To enforce use this configureRoutes method for child classes
//    */
//   abstract configureRoutes(): void;

//   /**
//    * HTTP methods
//    */
//   protected GET(path: string, ...handlers: RequestHandler<any>[]) {
//     this.$router.get(path, handlers);
//   }

//   protected POST(path: string, ...handlers: RequestHandler<any>[]) {
//     this.$router.post(path, handlers);
//   }

//   protected PUT(path: string, ...handlers: RequestHandler<any>[]) {
//     this.$router.put(path, handlers);
//   }

//   protected PATCH(path: string, ...handlers: RequestHandler<any>[]) {
//     this.$router.patch(path, handlers);
//   }

//   protected DELETE(path: string, ...handlers: RequestHandler<any>[]) {
//     this.$router.delete(path, handlers);
//   }

//   /**
//    * Show all registered routes within inherited controller
//    */
//   protected $showRoutes() {
//     let routePaths = [];
//     this.$router.stack.forEach((stack: any) => {
//       routePaths.push({
//         path: stack.route?.path,
//         method: (stack.route?.stack[0]?.method).toUpperCase(),
//         controller: this.constructor.name,
//       });
//     });
//     console.table(routePaths, ['method', 'path', 'controller']);
//   }

//   protected isAuth = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     let token =
//       req.body?.token ||
//       req.query?.token ||
//       req.headers['authorization'] ||
//       req.headers['x-access-token'];

//     if (!token) {
//       res.status(403).send('Unauthorized!');
//       return;
//     }
//     if (token.toLowerCase().startsWith('bearer')) {
//       token = token.slice('bearer'.length).trim();
//     }
//     try {
//       const decoded = verifyToken(token);
//       req.user = decoded.aud;
//     } catch (err) {
//       res.status(401).send('Invalid Token');
//       return;
//     }
//     next();
//   };
// }

export default abstract class BaseController {
  public $router: Router;
  public path: string;

  constructor(controllerPath = '/') {
    this.$router = Router();
    this.path = controllerPath;
  }

  abstract configureRoutes(): void;

  // Typed HTTP methods
  protected GET<T = any>(path: string, ...handlers: RequestHandler<T>[]) {
    this.$router.get(path, ...handlers);
  }

  protected POST<T = any>(path: string, ...handlers: RequestHandler<T>[]) {
    this.$router.post(path, ...handlers);
  }

  protected PUT<T = any>(path: string, ...handlers: RequestHandler<T>[]) {
    this.$router.put(path, ...handlers);
  }

  protected PATCH<T = any>(path: string, ...handlers: RequestHandler<T>[]) {
    this.$router.patch(path, ...handlers);
  }

  protected DELETE<T = any>(path: string, ...handlers: RequestHandler<T>[]) {
    this.$router.delete(path, ...handlers);
  }

  // Central error handler
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler {
    return (req, res, next) => fn(req, res, next).catch(next);
  }

  // Standardized responses
  protected sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  protected sendError(
    res: Response,
    message: string,
    statusCode = 500
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  // Improved route logging
  protected $showRoutes() {
    if (process.env.NODE_ENV === 'development') {
      const routes = this.$router.stack
        .filter((layer) => layer.route)
        .map((layer) => ({
          method: Object.keys(layer.route.methods)[0].toUpperCase(),
          path: `${this.path}${layer.route.path}`,
          controller: this.constructor.name,
        }));
      console.table(routes);
    }
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
