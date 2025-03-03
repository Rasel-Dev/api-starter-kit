import { Request, Response } from 'express';
import BaseController from './base.controller';

class HealthController extends BaseController {
  constructor() {
    super('health');
    this.configureRoutes();
  }

  private checkHealth = async (_req: Request, res: Response) => {
    this.sendSuccess(res, {
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  };

  public configureRoutes() {
    this.GET('/', this.checkHealth);
    //
    // this.$showRoutes();
  }
}

export default new HealthController();
