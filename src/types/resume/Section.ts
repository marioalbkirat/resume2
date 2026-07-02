// import { SectionTarget, Visibility } from "@prisma/client";
// import { UserDB } from "./User";
// import { Content } from "./Content";
// import { Prisma } from "@prisma/client";
// export interface Schema extends Prisma.JsonObject {
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
//     content: Content;
//     isArchived: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//     user: UserDB;
// }
// export type Section = Omit<SectionDB, 'user'>;
// D:\cvBuilder\resumebuilder\src\types\resume\Section.ts

import { SectionTarget, Visibility } from "@prisma/client";
import { UserDB } from "./User";
import { Content } from "./Content";
import { Prisma } from "@prisma/client";

export interface Schema extends Prisma.JsonObject {
    id: string;
    name: string;
    type: string;
    tag: string;
    selectorGroup: string;
    children: Schema[];
    parentId?: string; // إضافة parentId اختياري
}

export interface SectionDB {
    id: string;
    name: string;
    target: SectionTarget;
    visibility: Visibility;
    authorId: string;
    schema: Schema;
    content: Content;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: UserDB;
}

export type Section = Omit<SectionDB, 'user'>;