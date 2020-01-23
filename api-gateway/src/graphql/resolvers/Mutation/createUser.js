import UsersService from "#root/adapters/UsersService.js";

const createUserReslover = async (_, { email, password }) => {
  return await UsersService.createUser({ email, password });
};

export default createUserReslover;
