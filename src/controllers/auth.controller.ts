import { emailReg } from '@/libs';
import { setJWT } from '@/libs/cookie';
import userRepo from '@/repos/user';
import { compare, hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import BaseController from './base.controller';

class AuthController extends BaseController {
  constructor() {
    super();
    this.configureRoutes();
  }
  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
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
        res.status(400).json(errors).end();
        return;
      }
      const hashedPassword = await hash(password, 12);
      // pass 'user' object to repository/service
      const user = await userRepo.save({
        fullname,
        username,
        email,
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
      res.json({ id: user.user_id, fullname, username, email, token });
    } catch (error: any) {
      next(error);
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      //validation
      if (!username || !password || (password && password.length < 8)) {
        res.status(400).json({ message: 'Incorrect login credentials!' }).end();
        return;
      }

      const user = await userRepo.identifier(username);
      if (!user) {
        res.status(400).json({ message: 'Incorrect login credentials!' }).end();
        return;
      }

      if (!(await compare(password, user.hashedPassword))) {
        res.status(400).json({ message: 'Incorrect login credentials!' }).end();
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

      res.json({ id: user?.user_id, ...profile, token });
    } catch (error) {
      next(error);
    }
  };
  /**
   * configure router
   */
  configureRoutes() {
    this.router.post('/signup', this.register);
    this.router.post('/signin', this.login);
    // this._showRoutes()
  }
}
export default new AuthController();
