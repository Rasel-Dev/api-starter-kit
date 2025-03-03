import userRepo from '@/repos/user';
import { Request, Response } from 'express';
import BaseController from './base.controller';

class UserController extends BaseController {
  constructor() {
    super('users');
    this.configureRoutes();
  }

  private profile = async (req: Request, res: Response) => {
    const userId = req.user;
    const profile = await userRepo.info(userId);
    this.sendSuccess(res, { id: userId, ...profile });
  };

  /**
   * configure router
   */
  public configureRoutes() {
    // auth
    this.GET(
      '/',
      this.asyncHandler(this.isAuth),
      this.asyncHandler(this.profile)
    );
    //
    // this.$showRoutes();
  }
}

export default new UserController();
