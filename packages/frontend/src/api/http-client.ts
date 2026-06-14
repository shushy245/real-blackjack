import axios from 'axios';

export const httpClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const normaliseNulls = (value: unknown): unknown => {
    if (value === null) return undefined;
    if (Array.isArray(value)) return value.map(normaliseNulls);
    if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normaliseNulls(v)]));

    return value;
};

httpClient.interceptors.response.use((response) => {
    response.data = normaliseNulls(response.data);

    return response;
});
