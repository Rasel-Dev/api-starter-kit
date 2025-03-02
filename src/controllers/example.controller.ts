import { Request, Response } from 'express';
import BaseController from './base.controller';

class ExampleController extends BaseController {
  constructor() {
    super('/');
    this.configureRoutes();
  }

  private test = async (_req: Request, res: Response) => {
    this.sendSuccess(res, { message: 'Hello World!' });
  };

  /**
   * configure router
   */
  public configureRoutes() {
    // auth
    this.GET('/', this.test);
    //
    // this.$showRoutes();
  }
}

export default new ExampleController();
