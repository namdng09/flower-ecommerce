import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '~/modules/user/userEntity';

const configurePassport = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || ''
  };

  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        const user = await UserModel.findById(jwtPayload.id).select(
          '-password'
        );
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  const googleOpts = {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
    session: false
  };

  const googleDashboardOpts = {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google-dashboard/callback',
    session: false
  };

  passport.use(
    'google',
    new GoogleStrategy(
      googleOpts,
      async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.use(
    'google-dashboard',
    new GoogleStrategy(
      googleDashboardOpts,
      async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
};

export default configurePassport;
