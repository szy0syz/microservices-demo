const userSessionResolver = async (_, args, context) => {
  if (args.me !== true) throw new Error('Unsupported argument value');
  return context.res.locals.userSession;
};

export default userSessionResolver;
