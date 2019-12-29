import Context from "../Context";

export default {
  Query: {
    me(_: any, __: any, { user }: Context) {
      if (user.isLoggedIn()) {
        return user;
      } else {
        return null;
      }
    }
  },

  Mutation: {
    async register(
      _: any,
      { email, password }: { email: string; password: string },
      { auth }: Context
    ) {
      const user = await auth.register(email, password);
      if (user != null && user.isLoggedIn()) {
        return user;
      }
      return null;
    },

    async login(
      _: any,
      { email, password }: { email: string; password: string },
      { auth }: Context
    ) {
      const user = await auth.login(email, password);
      if (user != null && user.isLoggedIn()) {
        return user;
      }
      return null;
    },

    async logout(_: any, {}: {}, { auth }: Context) {
      await auth.logout();
      return "OK";
    }
  }
};
