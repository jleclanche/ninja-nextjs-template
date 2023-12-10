export const AUTH_TOKEN_COOKIE = "authToken";

const basicAuthToken = (username: string, password: string) =>
    Buffer.from(`${username}:${password}`).toString("base64");

export const basicAuth = (username: string, password: string) =>
    `Basic ${basicAuthToken(username, password)}`;

export const bearerAuth = (token: string) => `Bearer ${token}`;
