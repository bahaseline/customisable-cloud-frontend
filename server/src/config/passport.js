const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { upsertUser } = require('../services/userService');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertUser({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          accessToken,
          refreshToken,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
