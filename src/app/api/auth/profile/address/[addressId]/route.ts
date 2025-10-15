export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Profile } from "@/lib/models/Profile";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { badRequest, ok } from "@/lib/response";

// DELETE /api/profile/address/[addressId]
export async function DELETE(
    req: NextRequest,
    { params }: { params: { addressId: string } }
) {
    try {
        const decoded = requireAuth(req);
        await dbConnect();

        const profile = await Profile.findOne({ user: decoded.sub });
        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        if (!Array.isArray(profile.addresses)) {
            return NextResponse.json(
                { message: "No addresses found in profile" },
                { status: 400 }
            );
        }

        // Find address index
        const addressIndex = profile.addresses.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any) => a._id?.toString() === params.addressId
        );

        if (addressIndex === -1) {
            return NextResponse.json({ message: "Address not found" }, { status: 404 });
        }

        // Remove the address
        profile.addresses.splice(addressIndex, 1);

        // Ensure at least one default address remains
        if (
            profile.addresses.length > 0 &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !profile.addresses.some((a: any) => a.isDefault)
        ) {
            profile.addresses[0].isDefault = true; // fallback default
        }

        await profile.save();

        return ok({
            message: "Address deleted successfully",
            addresses: profile.addresses,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("❌ Delete address error:", err);
        return badRequest(err.message || "Failed to delete address");
    }
}
