export const resolveQueryParams = (url: string, queryParams: any) =>
    queryParams && Object.keys(queryParams).length
        ? `${url}?${new URLSearchParams(queryParams)}`
        : url;

export const fetchAsJSON = (url: string, init: RequestInit, data: unknown) =>
    fetch(url, {
        ...init,
        headers: { ...init.headers, "content-type": "application/json" },
        body: JSON.stringify(data),
    });
