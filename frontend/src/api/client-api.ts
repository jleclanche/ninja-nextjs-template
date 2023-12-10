import { getCookie, removeCookie } from "typescript-cookie";
import { AUTH_TOKEN_COOKIE, basicAuth, bearerAuth } from "./auth";
import { fetchAsJSON } from "./fetch";
import { Token, User, ValidHttpMethod } from "./interfaces";

const clearAuthCookie = () => removeCookie(AUTH_TOKEN_COOKIE);
const getAuthToken = () => getCookie(AUTH_TOKEN_COOKIE);
const withAuthBearerToken: () => { authorization: string } | {} = () => {
    const token = getAuthToken();
    return token ? { authorization: bearerAuth(token) } : {};
};

enum ErrorCode {
    INVALID_CREDENTIALS,
    CONFLICT,
    UNKNOWN,
}

export interface ErrorDetails {
    code: ErrorCode;
    message: string;
    url: string;
    body: string;
}

const clientErrorHandler: (
    res: Response,
    url: string,
) => Promise<ErrorDetails | null> = async (res, url) => {
    switch (res.status) {
        case 200:
        case 201:
        case 204:
            return null;
        case 401:
            const data = await res.json();
            if (data.detail === "INVALID_TOKEN") {
                clearAuthCookie();
                const searchParams = new URLSearchParams();
                searchParams.set("next", window.location.pathname);
                window.location.href = `/login?${searchParams.toString()}`;
                return null;
            } else if (data.detail == "INVALID_CREDENTIALS") {
                return {
                    code: ErrorCode.INVALID_CREDENTIALS,
                    message: "Invalid username or password",
                    url,
                    body: await data,
                };
            } else {
                return {
                    code: ErrorCode.UNKNOWN,
                    message:
                        "API authentication error. Please contact support if this persists.",
                    url,
                    body: data,
                };
            }
        case 409:
            const resp = await res.json();
            return {
                code: ErrorCode.CONFLICT,
                message: resp.detail,
                url,
                body: resp,
            };
        // Handle 404 like other 500s, because they happen on interaction only.
        // Only server-side 404s should throw a 404 at the NextJS level.
        case 404:
        case 422:
        case 500:
        case 502:
            const body = await res.text();
            return {
                code: ErrorCode.UNKNOWN,
                message: "Server error. Please contact support if this persists.",
                url,
                body,
            };
    }
    return {
        code: ErrorCode.UNKNOWN,
        message: `API error ${res.status}. Please contact support if this persists.`,
        url,
        body: await res.text(),
    };
};

const _fetch = async <T>(method: ValidHttpMethod, path: string, data?: any) => {
    const res = await fetchAsJSON(
        "/api" + path,
        { method, headers: withAuthBearerToken() },
        data,
    );
    if (res.status === 204) return null as T;
    const error = await clientErrorHandler(res, path);
    if (error) {
        throw new Error(error.message);
    }
    return (await res.json()) as T;
};

const _get = <T>(path: string, data?: any) => _fetch<T>("GET", path, data);
const _post = <T>(path: string, data: any) => _fetch<T>("POST", path, data);
const _put = <T>(path: string, data: any) => _fetch<T>("PUT", path, data);
const _patch = <T>(path: string, data: any) => _fetch<T>("PATCH", path, data);
const _delete = <T>(path: string, data?: any) => _fetch<T>("DELETE", path, data);

export const signIn: (
    email: string,
    password: string,
) => Promise<{ token: Token | null; error: ErrorDetails | null }> = async (
    email,
    password,
) => {
    const url = "/api/v1/auth/token";
    const res = await fetchAsJSON(url, { method: "POST" }, { email, password });

    if (res.status === 200) {
        return { token: await res.json(), error: null };
    } else {
        return { token: null, error: await clientErrorHandler(res, url) };
    }
};

export const registerUser = async (data: { email: string }) => {
    return await _post<User>("/v1/users", data);
};

export const updateUserDetails = async (user: {
    email?: string;
    full_name?: string;
    locale?: string;
    email_comments?: boolean;
    email_newsletter?: boolean;
}) => _patch<User>("/v1/user", user);

export const changePassword = async ({
    username,
    oldPassword,
    newPassword,
}: {
    username: string;
    oldPassword: string;
    newPassword: string;
}) => {
    const path = "/api/v1/user";
    const res = await fetchAsJSON(
        path,
        {
            method: "PATCH",
            headers: { authorization: basicAuth(username, oldPassword) },
        },
        { password: newPassword },
    );
    const error = await clientErrorHandler(res, path);
    if (error) {
        throw new Error(error.message);
    }
    return (await res.json()) as User;
};
