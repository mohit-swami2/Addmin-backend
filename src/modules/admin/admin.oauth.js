import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { findOrCreateOAuthAdmin } from './admin.service.js';

const callbackBase = () => process.env.OAUTH_CALLBACK_BASE_URL || 'http://localhost:5000';

export const configureOAuth = () => {
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const Admin = (await import('./admin.model.js')).default;
      const user = await Admin.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${callbackBase()}/api/admin/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('Google account has no email'));
            const admin = await findOrCreateOAuthAdmin({
              provider: 'google',
              providerId: profile.id,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
            });
            done(null, admin);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${callbackBase()}/api/admin/auth/github/callback`,
          scope: ['user:email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
            const admin = await findOrCreateOAuthAdmin({
              provider: 'github',
              providerId: profile.id,
              email,
              name: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value,
            });
            done(null, admin);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }
};

export const googleAuthMiddleware = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return next({ status: 503, message: 'Google OAuth is not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const githubAuthMiddleware = (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return next({ status: 503, message: 'GitHub OAuth is not configured' });
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};
