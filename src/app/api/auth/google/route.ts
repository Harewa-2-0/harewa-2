// /app/api/auth/google/route.ts (or /pages/api/auth/google.ts for pages router)

import passport from 'passport';
import '@/lib/passport'; // where your GoogleStrategy is configured
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false, // important since you're not using sessions
    })(req, res);
}
