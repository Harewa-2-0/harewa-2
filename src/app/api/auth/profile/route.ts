export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { User } from "@/lib/models/User";
import { Profile } from "@/lib/models/Profile";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";

export async function PATCH(req: NextRequest) {
    try {
        const decoded = requireAuth(req);
        await dbConnect();

        const body = await req.json();

        const {
            email,
            username,
            phone,
            firstName,
            lastName,
            bio,
            profilePicture,
            addresses,
        } = body;

        // Fetch user and profile
        const user = await User.findById(decoded.sub);
        const profile = await Profile.findOne({ user: decoded.sub });

        if (!user || !profile) {
            return NextResponse.json(
                { message: "User or profile not found" },
                { status: 404 }
            );
        }

        // ✅ Update user fields
        if (email !== undefined && email !== "") user.email = email;
        if (username !== undefined && username !== "") user.username = username;
        if (phone !== undefined && phone !== "") user.phoneNumber = phone;

        await user.save();

        // ✅ Update profile fields
        if (firstName !== undefined) profile.firstName = firstName;
        if (lastName !== undefined) profile.lastName = lastName;
        if (bio !== undefined) profile.bio = bio; // 👈 bio included here
        if (profilePicture !== undefined) profile.profilePicture = profilePicture;

        if (Array.isArray(addresses)) {
            const defaultCount = addresses.filter((a) => a.isDefault).length;
            if (defaultCount > 1) {
                return NextResponse.json(
                    { message: "Only one address can be set as default." },
                    { status: 400 }
                );
            }

            profile.addresses = addresses;
        }

        await profile.save();

        return NextResponse.json({
            message: "User and profile updated successfully",
            user: {
                email: user.email,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified,
                phoneNumber: user.phoneNumber,
            },
            profile,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        const message =
            err.message === "Unauthorized" ? "Unauthorized" : err.message;
        const status = message === "Unauthorized" ? 401 : 500;

        return NextResponse.json({ message }, { status });
    }
}
