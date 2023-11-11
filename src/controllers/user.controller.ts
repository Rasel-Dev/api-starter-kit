import userRepo from '@/repos/user';
import { NextFunction, Request, Response } from 'express';
import BaseController from './base.controller';

class UserController extends BaseController {
  constructor() {
    super();
    this.configureRoutes();
  }

  private profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user;
      const profile = await userRepo.info(userId);
      res.json({ id: userId, ...profile });
    } catch (error) {
      next(error);
    }
  };

  /**
   * configure router
   */
  public configureRoutes() {
    // auth
    this.GET('/', this.isAuth, this.profile);
    //
    // this.$showRoutes();
  }
}

export default new UserController();
