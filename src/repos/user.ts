import prismadb from '@/libs/prismadb';
import { Prisma, users } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

class UserRepo {
  private user: Prisma.usersDelegate<DefaultArgs>;
  constructor() {
    this.user = prismadb.users;
  }
  /**
   * Check uniqueness into filterBy param
   * @param input This should be username or email
   * @param filterBy username | email
   * @returns user_id | null
   */
  public isExists(input: string, filterBy: 'username' | 'email' = 'username') {
    const where =
      filterBy === 'username'
        ? { username: input?.toLowerCase() }
        : { email: input?.toLowerCase() };

    return this.user.findUnique({
      where,
      select: {
        user_id: true,
      },
    });
  }
  /**
   * Get the login credentials
   * @param input username or email
   * @returns user_id, hashedPassword | null
   */
  public identifier(input: string) {
    return this.user.findFirst({
      where: {
        OR: [
          { username: input?.toLowerCase() },
          { email: input?.toLowerCase() },
        ],
      },
      select: {
        user_id: true,
        hashedPassword: true,
      },
    });
  }
  /**
   * This method creates a new user
   * @param data user body data
   * @returns user_id, fullname, username, avater, createdAt
   */
  public save(data: Omit<users, 'user_id' | 'isActive' | 'createdAt'>) {
    return this.user.create({
      data,
      select: {
        user_id: true,
        fullname: true,
        username: true,
        avater: true,
        createdAt: true,
      },
    });
  }
  /**
   * Get user information
   * @param user_id Current user
   * @returns fullname, username, avater, createdAt
   */
  public info(user_id: string) {
    return this.user.findUnique({
      where: {
        user_id,
      },
      select: {
        fullname: true,
        username: true,
        avater: true,
        createdAt: true,
      },
    });
  }
  /**
   * Get simple user label info
   * @param user_id string
   * @returns fullname, avater
   */
  public label(user_id: string) {
    return this.user.findUnique({
      where: { user_id },
      select: { fullname: true, avater: true },
    });
  }
  /**
   * Get user password hashed
   * @param user_id string
   * @returns hahsedPassword
   */
  public getHash(user_id: string) {
    return this.user.findUnique({
      where: { user_id },
      select: { hashedPassword: true },
    });
  }
  /**
   * update new password
   * @param hashedPassword hash password string
   * @param user_id who perform update
   * @returns user_id
   */
  public patchHash(hashedPassword: string, user_id: string) {
    return this.user.update({
      where: { user_id },
      data: { hashedPassword },
      select: { user_id: true },
    });
  }
  /**
   * update user avater
   * @param avater string name of avater file
   * @param user_id who perform update
   * @returns
   */
  public patchAvater(avater: string, user_id: string) {
    return this.user.update({
      where: { user_id },
      data: { avater },
      select: { user_id: true },
    });
  }
}
export default new UserRepo();

// export const checkUniqueUsername = (username: string) =>
//   prismadb.users.findFirst({
//     select: { user_id: true },
//     where: {
//       username,
//     },
//   });

// export const checkUniqueEmail = (email: string) =>
//   prismadb.users.findFirst({
//     select: { user_id: true },
//     where: {
//       email,
//     },
//   });

// export const getUserByUsername = (username: string) =>
//   prismadb.users.findFirst({
//     select: { user_id: true, hashedPassword: true },
//     where: {
//       username,
//     },
//   });

// export const getAvaterByUserId = (user_id: string) =>
//   prismadb.users.findFirst({
//     select: {
//       avater: true,
//     },
//     where: {
//       user_id,
//     },
//   });

// export const getCurrentUser = (user_id: string) =>
//   prismadb.users.findFirst({
//     where: {
//       user_id,
//     },
//     select: {
//       fullname: true,
//       username: true,
//       email: true,
//       avater: true,
//       createdAt: true,
//     },
//   });
