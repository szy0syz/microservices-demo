import UsersService from '#root/adapters/UsersService.js';

const deleteUserSessionResolver = async (_, { sessionId }, context) => {
  UsersService.deleteUserSession({ sessionId });

  context.res.clearCookie('userSessionId');

  return true;
};

export default deleteUserSessionResolver;
