import { UserDB } from "./User";
import { Content } from "./Content";

export interface Schema {
    id: string;
    name: string;
    type: string;
    tag: string;
    role?: "default" | "sectionIcon";
    children: Schema[];
    parentId?: string;
}

export interface SectionDB {
    id: string;
    name: string;
    target: "RESUME" | "PORTFOLIO";
    visibility: "OFFICIAL" | "COMMUNITY" | "PRIVATE";
    authorId: string;
    schema: Schema;
    content: Record<string, Content>;
    createdAt: Date;
    updatedAt: Date;
    user: UserDB;
}

export type Section = Omit<SectionDB, 'user'>;
