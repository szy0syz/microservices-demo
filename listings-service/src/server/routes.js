import { Listing } from "#root/db/models";

const setupRoutes = app => {
  app.get("/listings", async (_, res) => {
    const listings = await Listing.findAll();
    return res.json(listings);
  });
};

export default setupRoutes;
