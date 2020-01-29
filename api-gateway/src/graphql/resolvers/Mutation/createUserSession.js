import UsersService from '#root/adapters/UsersService.js';

const createUserSessionResolver = async (_, { email, password }, context) => {
  const userSession = await UsersService.createUserSession({ email, password });

  context.res.cookie('userSessionId', userSession.id, { httpOnly: true });

  return userSession;
};

export default createUserSessionResolver;
