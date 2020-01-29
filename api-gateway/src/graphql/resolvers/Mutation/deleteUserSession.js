import UsersService from '#root/adapters/UsersService.js';

const deleteUserSessionResolver = async (_, { sessionId }, context) => {
  await UsersService.deleteUserSession({ sessionId });

  context.res.clearCookie('userSessionId');

  return true;
};

export default deleteUserSessionResolver;
