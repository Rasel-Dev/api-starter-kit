import { emailReg } from '@/libs';
import { setJWT } from '@/libs/cookie';
import userRepo from '@/repos/user';
import { compare, hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import BaseController from './base.controller';

class AuthController extends BaseController {
  constructor() {
    // super();
    // this.configureRoutes();
    super('auth');
    this.configureRoutes();
  }
  private register = async (req: Request, res: Response) => {
    // TODO: Like a create random record
    const errors: { [index: string]: string } = {};
    const { fullname, username, email, password } = req.body;
    // console.log('req.body :', req.body)
    // 1st layer validation
    if (!fullname) errors.fullname = 'Fullname is required!';
    if (!username) errors.username = 'Username is required!';
    if (!email) errors.email = 'Email address is required!';
    if (!password) errors.password = 'Password is required!';
    // 2nd layer validation
    if (!errors?.fullname && fullname.length < 4)
      errors.fullname = 'Fullname at least 4 characters';
    if (!errors?.username && username.length < 4)
      errors.username = 'Username at least 4 characters';
    if (password && password.length < 8)
      errors.password = 'Password should contains at least 8 characters';
    if (email && !emailReg.test(email)) errors.email = 'Email is not valid!';

    // db check & it's called 3rd layer validation
    if (!errors.username) {
      const checkUsername = await userRepo.isExists(username, 'username');
      if (checkUsername) errors.username = 'Username already taken!';
    }
    if (!errors.email) {
      const checkEmail = await userRepo.isExists(email, 'email');
      if (checkEmail) errors.email = 'Email address already taken!';
    }

    if (Object.keys(errors).length) {
      this.sendError(res, errors, 400);
      return;
    }
    const hashedPassword = await hash(password, 12);
    // pass 'user' object to repository/service
    const user = await userRepo.save({
      fullname,
      username: username?.toLowerCase(),
      email: email?.toLowerCase(),
      hashedPassword,
      avater: null,
    });
    const token = sign(
      { aud: user?.user_id, iat: Math.floor(Date.now() / 1000) - 30 },
      process.env?.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
    // set token to response cookie
    setJWT(token, res);
    // response the final data
    this.sendSuccess(
      res,
      {
        id: user.user_id,
        fullname,
        username,
        email,
        token,
      },
      201
    );
  };

  private login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    //validation
    if (!username || !password || (password && password.length < 8)) {
      this.sendError(res, 'Incorrect login credentials!', 400);
      return;
    }

    const user = await userRepo.identifier(username);
    if (!user) {
      this.sendError(res, 'Incorrect login credentials!', 400);
      return;
    }

    if (!(await compare(password, user.hashedPassword))) {
      this.sendError(res, 'Incorrect login credentials!', 400);
      return;
    }

    const profile = await userRepo.info(user.user_id);
    const token = sign(
      { aud: user?.user_id, iat: Math.floor(Date.now() / 1000) - 30 },
      process.env?.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
    // set token to response cookie
    setJWT(token, res);

    this.sendSuccess(res, { id: user?.user_id, ...profile, token });
  };
  /**
   * configure router
   */
  public configureRoutes() {
    this.POST('/signup', this.register);
    this.POST('/signin', this.login);
    //
    // this.$showRoutes();
  }
}
export default new AuthController();
