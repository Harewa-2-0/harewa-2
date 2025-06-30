// /app/api/auth/google/callback/route.ts (or /pages/api/auth/google/callback.ts)

import { NextApiRequest, NextApiResponse } from 'next';
import passport from 'passport';
import '@/lib/passport';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    passport.authenticate('google', { session: false }, async (err, user) => {
        if (err || !user) {
            return res.redirect('/login?error=OAuthFailed');
        }

        const accessToken = signAccessToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'admin',
        });

        const { token: refreshToken, jti: newJTI } = signRefreshToken(user._id.toString());

        user.refreshTokenJTI = newJTI;
        await user.save();

        const accessCookie = `access-token=${accessToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7
            }; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Lax;' : ''}`;

        const refreshCookie = `refresh-token=${refreshToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7
            }; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Lax;' : ''}`;

        res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);

        // Redirect to dashboard or wherever
        return res.redirect('/');
    })(req, res);
}
