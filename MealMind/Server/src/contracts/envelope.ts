/** Successful JSON responses use `{ data: T }` (errors use `{ error: ... }` from middleware). */
export type ApiSuccess<T> = { data: T };
