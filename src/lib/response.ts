import { NextResponse } from "next/server";

type ResponseData = Record<string, unknown> | string;

export function jsonResponse(
    data: ResponseData,
    status: number = 200
): NextResponse {
    const body = typeof data === "string" ? { message: data } : data;

    return new NextResponse(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
export function errorResponse(
    message: string,
    status: number = 400
): NextResponse {
    return jsonResponse({ error: message }, status);
}

export function ok(data: ResponseData) {
    return jsonResponse(data, 200);
}

export function badRequest(message = "Bad Request") {
    return jsonResponse({ message }, 400);
}

export function unauthorized(message = "Unauthorized") {
    return jsonResponse({ message }, 401);
}

export function notFound(message = "Not Found") {
    return jsonResponse({ message }, 404);
}

export function serverError(message = "Something went wrong") {
    return jsonResponse({ message }, 500);
}
export function created(data: ResponseData) {
    return jsonResponse(data, 201);
}