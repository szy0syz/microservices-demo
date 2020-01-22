import { User } from "#root/db/models";
import hashPassword from "#root/helpers/hashPassword";
import generateUUID from "#root/helpers/generateUUID";

const setupRoutes = app => {
  app.post("/users", async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
      return next(new Error("Invalid body!"));
    }

    try {
      const newUser = await User.create({
        email: req.body.email,
        id: generateUUID(),
        passwordHash: hashPassword(req.body.password)
      });

      return res.json(newUser);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
};

export default setupRoutes;
