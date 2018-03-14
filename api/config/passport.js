import passport from 'koa-passport';
import models from '../src/models';
import { Strategy } from 'passport-local';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await models.User.findById(id);
  if (user) {
    done(null, user);
  } else {
    done(err);
  }
});

passport.use(
  'local',
  new Strategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const user = await models.User.findOne({ where: { username } });
        if (!user) {
          return done(null, false);
        }

        const isMatch = await user.validatePassword(password);

        if (!isMatch) {
          return done(null, false);
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);
