// // Social register
// import { NextResponse } from "next/server";
// import { getAuthorizedToken } from "@/lib/jwt";
// import { User } from "@/lib/models/User";

// export async function POST(req: Request) {
//     const { uId, email, username, phoneNumber, gender, } = await req.json();
//     const isUserExist = await User.findOne({ uId: uId });
//     if (isUserExist)
//         return NextResponse.json(
//             { message: "Email already registered" },
//             { status: 400 }
//         );
//     const newUser = await User.create({
//         uId,
//         email,
//         username,
//         phoneNumber,
//         gender,
//     });

//     const token = getAuthorizedToken({ user: newUser });
//     return NextResponse.json({
//         status: "success",
//         message: "Account created successfully.",
//         data: { ...newUser._doc, token },
//     });
// }
