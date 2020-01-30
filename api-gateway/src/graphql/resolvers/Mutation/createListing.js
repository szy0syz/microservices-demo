import ListingsService from "#root/adapters/ListingsService.js";

const createListingReslover = async (_, { description, title }, context) => {
  if (!context.res.locals.userSession) throw new Error('Not Logged in!');

  return await ListingsService.createListing({ description, title });
};

export default createListingReslover;
