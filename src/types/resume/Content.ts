export interface Content extends Record<string, unknown> {
    id: string;
    type: string;
    prop?: Record<string, string>;
    value: string;
}
