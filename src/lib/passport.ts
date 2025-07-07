import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from './models/User';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    throw new Error('Missing Google OAuth environment variables');
}

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('No email found in Google profile'));
                }
                const userByEmail = await User.findOne({ email });

                if (userByEmail && !userByEmail.googleId) {
                    return done(new Error('Account exists. Use email/password instead.'));
                }

                let user = await User.findOne({ googleId: profile.id, email });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email,
                        username: profile.displayName,
                        isVerified: true,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Optional: passport.serializeUser / deserializeUser if using sessions
