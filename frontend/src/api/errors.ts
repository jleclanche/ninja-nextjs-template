export class APIError extends Error {}
export class HttpUnauthorizedError extends APIError {}
export class HttpNotFoundError extends APIError {}
export class HttpServerError extends APIError {}

export class InvalidCredentialsError extends APIError {}
