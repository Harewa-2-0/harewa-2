// import { NextResponse } from "next/server";
// import { verifyOtpAndGenerateToken, getAuthorizedToken } from "@/lib/otp";
// import type { VerifiedAdmin } from "@/lib/types/auth";
// import { sendWelcomeEmail } from "@/lib/mailer";
// import connectDB from "@/lib/db";
// import { Profile } from "@/lib/models/Profile";
// import { User } from "@/lib/models/User";

// export async function POST(req: Request) {
//     await connectDB();
//     const { uId } = await req.json();
//     const isUserExist = await User.findOne({ uId: uId });
//     if (!isUserExist)
//         return NextResponse.json({
//             status: "false",
//             message: "Account not found!",
//             data: null,
//         });
//     if (isUserExist.accountDeleted)
//         return NextResponse.json({ success: false, message: "User Account deleted" });

//     const token = getAuthorizedToken({ user: isUserExist });
//     return NextResponse.json({
//         status: "success",
//         message: "User login successfully.",
//         data: { ...isUserExist._doc, token },
//     });
// }