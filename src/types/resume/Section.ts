// // import { UserDB } from "./User";
// import { Content } from "./Content";
// // export interface Schema {
//     id: string;
//     name: string;
//     type: string;
//     tag: string;
//     selectorGroup: string;
//     children: Schema[];
// }
// export interface SectionDB {
//     id: string;
//     name: string;
//     target: SectionTarget;
//     visibility: Visibility;
//     authorId: string;
//     schema: Schema;
//     content: Record<string, Content>;
//     isArchived: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//     user: UserDB;
// }
// export type Section = Omit<SectionDB, 'user'>;
// D:\cvBuilder\resumebuilder\src\types\resume\Section.ts

import { UserDB } from "./User";
import { Content } from "./Content";

export interface Schema {
    id: string;
    name: string;
    type: string;
    tag: string;
    role?: "default" | "sectionIcon";
    selectorGroup: string;
    children: Schema[];
    parentId?: string;
    value?: string;
}

export interface SectionDB {
    id: string;
    name: string;
    target: "RESUME" | "PORTFOLIO";
    visibility: "OFFICIAL" | "COMMUNITY" | "PRIVATE";
    authorId: string;
    schema: Schema;
    content: Record<string, Content>;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: UserDB;
}

export type Section = Omit<SectionDB, 'user'>;