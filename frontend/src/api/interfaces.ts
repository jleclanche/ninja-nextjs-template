export type ValidHttpMethod = "GET" | "DELETE" | "POST" | "PUT" | "PATCH";

export interface PaginatedResponse<T> {
    count: number;
    items: T[];
}

export interface Token {
    token: string;
    user: User;
}

export interface User {
    email: string;
    full_name: string;
    locale: string;
}
