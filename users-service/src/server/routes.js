import { addHours } from 'date-fns';
import { User, UserSession } from '#root/db/models';
import hashPassword from '#root/helpers/hashPassword';
import generateUUID from '#root/helpers/generateUUID';
import passwordCompareSync from '#root/helpers/passwordCompareSync';

const USER_SESSION_EXPIRY_HOURS = 1;

const setupRoutes = app => {
  app.post('/sessions', async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
      return next(new Error('Invalid body!'));
    }

    try {
      const user = await User.findOne({
        attributes: {},
        where: {
          email: req.body.email,
        },
      });

      if (!user) return next(new Error('Invalid email!'));

      if (!passwordCompareSync(req.body.password, user.passwordHash)) {
        return next(new Error('Incorrect password!'));
      }

      const expiresAt = addHours(new Date(), USER_SESSION_EXPIRY_HOURS);
      const sessionToken = generateUUID();

      const userSession = await UserSession.create({
        expiresAt,
        id: sessionToken,
        userId: user.id,
      });

      return res.json(userSession);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/sessions/:sessionId', async (req, res, next) => {
    try {
      const userSession = await UserSession.findByPk(req.params.sessionId);

      if (!userSession) {
        return next(new Error('Invalid session ID'));
      }

      await userSession.destroy();

      return res.json({});
    } catch (e) {
      return next(e);
    }
  });

  app.get('/sessions/:sessionId', async (req, res, next) => {
    try {
      const userSession = await UserSession.findByPk(req.params.sessionId);

      if (!userSession) {
        return next(new Error('Invalid session ID'));
      }

      return res.json(userSession);
    } catch (error) {
      return next(error);
    }
  });

  app.post('/users', async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
      return next(new Error('Invalid body!'));
    }

    try {
      const newUser = await User.create({
        email: req.body.email,
        id: generateUUID(),
        passwordHash: hashPassword(req.body.password),
      });

      return res.json(newUser);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });

  app.get('/users/:userId', async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.userId);

      if (!user) return next(new Error('Invalid user ID'));

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  });
};

export default setupRoutes;
