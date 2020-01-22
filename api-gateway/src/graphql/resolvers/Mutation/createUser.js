import UsersService from "#root/adapters/UsersService.js";

const createReslover = async (_, { email, password }) => {
  return await UsersService.createUser({ email, password });
};

export default createReslover;
