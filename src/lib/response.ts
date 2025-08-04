import { NextResponse } from "next/server";

type ResponseData = Record<string, unknown> | unknown | unknown[] | null;

interface SuccessBody {
    success: true;
    message: string;
    data?: ResponseData;
}

interface ErrorBody {
    success: false;
    error: string;
}

export function jsonResponse(
    data: ResponseData,
    status: number = 200,
    message: string = "Success"
): NextResponse {
    const body: SuccessBody = {
        success: true,
        message,
    };

    if (data !== null && typeof data !== "undefined") {
        body.data = data;
    }

    return new NextResponse(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function errorResponse(
    message: string,
    status: number = 400
): NextResponse {
    const body: ErrorBody = {
        success: false,
        error: message,
    };

    return new NextResponse(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

// ✅ Semantic helpers
export function ok(data: ResponseData, message = "Success") {
    return jsonResponse(data, 200, message);
}

export function created(data: ResponseData, message = "Created") {
    return jsonResponse(data, 201, message);
}
export function uploaded(data: ResponseData, message = "Uploaded") {
    return jsonResponse(data, 200, message);
}

export function badRequest(message = "Bad Request") {
    return errorResponse(message, 400);
}

export function unauthorized(message = "Unauthorized") {
    return errorResponse(message, 401);
}

export function notFound(message = "Not Found") {
    return errorResponse(message, 404);
}

export function serverError(message = "Something went wrong") {
    return errorResponse(message, 500);
}
export function conflict(message = "Conflict") {
    return errorResponse(message, 409);
}