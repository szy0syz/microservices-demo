import { Listing } from '#root/db/models';

const setupRoutes = app => {
  app.get('/listings', async (_, res) => {
    try {
      const listings = await Listing.findAll();
      return res.json(listings);
    } catch (error) {
      return next(error);
    }
  });

  app.post('/listings', async (req, res, next) => {
    if (!req.body.description || !req.body.title) {
      return next(new Error('Invalid body!'));
    }

    try {
      const listing = await Listing.create({
        description: req.body.description,
        title: req.body.title,
      });
      return res.json(listing);
    } catch (error) {
      return next(error);
    }
  });
};

export default setupRoutes;
