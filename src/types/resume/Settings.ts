export interface Settings {
    columns: "ONE" | "TWO";
    sidebar?: {
        position: "LEFT" | "RIGHT";
    };
    direction: "LTR" | "RTL",
    pageSize: "A4" | "LETTER",
    showIcons: boolean,
    fileName: string,
}