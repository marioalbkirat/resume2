interface StyleObject {
    [property: string]: string | number;
}

export interface ResumeStyle {
    global: StyleObject;
    selectors: Record<string, StyleObject>;
    elements: Record<string, StyleObject>;
    customCSS?: string;
}