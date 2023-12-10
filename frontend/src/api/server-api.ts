import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { bearerAuth } from "./auth";
import { APIError, HttpServerError, HttpUnauthorizedError } from "./errors";
import type { User, ValidHttpMethod } from "./interfaces";

const DEFAULT_HOST = "http://127.0.0.1:8000";
const API_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST || DEFAULT_HOST;

export const getAuthToken = () => cookies().get("authToken")?.value;

const makeAbsolute = (path: string) => API_HOST + "/api" + path;

const serverErrorHandler = async (res: Response, url: string) => {
    switch (res.status) {
        case 401:
            const data = await res.json();
            if (data.detail === "INVALID_TOKEN") {
                const searchParams = new URLSearchParams();
                searchParams.set("next", "");
                redirect(`/login?${searchParams.toString()}`);
            } else {
                throw new HttpUnauthorizedError(
                    `Access to ${url} unauthorized. Invalid authorization header?`,
                );
            }
        case 404:
            notFound();
        case 500:
        case 502:
            const body = await res.text();
            throw new HttpServerError(
                `Server error encountered while fetching: ${url}\n\n${body}`,
            );
    }

    throw new APIError(
        `Unknown error encountered while fetching: ${url} (HTTP status code ${res.status})`,
    );
};

const _fetch = async <T>(method: ValidHttpMethod, path: string, data?: any) => {
    const token = getAuthToken();
    if (!token) redirect("/login");

    const res = await fetch(makeAbsolute(path), {
        method,
        headers: { authorization: bearerAuth(token) },
        body: data,
    });

    switch (res.status) {
        case 200:
        case 201:
            return res.json() as T;
        case 204:
            // HTTP_NO_CONTENT:
            // No content is expected, so we can't just json() the result.
            // However, returning undefined as-is tells typescript that _fetch()
            // sometimes returns undefined. This is wrong, we "know" when it does.
            // Thus, if you're expecting HTTP 204, use `_fetch<undefined>`.
            return undefined as T;
        default:
            return serverErrorHandler(res, path);
    }
};

const _get = <T>(path: string) => _fetch<T>("GET", path);
const _post = <T>(path: string, data?: any) => _fetch<T>("POST", path, data);
const _patch = <T>(path: string, data?: any) => _fetch<T>("PATCH", path, data);
const _delete = <T>(path: string, data?: any) => _fetch<T>("DELETE", path, data);

export const fetchUser = async () => _get<User>("/v1/user");
export const fetchUserWithoutLoginRedirect = async () => {
    const token = getAuthToken();
    const path = makeAbsolute("/v1/user");

    if (token) {
        try {
            const res = await fetch(path, {
                method: "GET",
                headers: token ? { authorization: bearerAuth(token) } : undefined,
            });
            const user = await res.json();
            if (user) return user as User;
        } catch (e) {
            // Most likely: The API is down, or an error decoding JSON.
            // Either way safe to just assume the user is not logged in.
            return;
        }
    }
};
