import { UserDB } from "./User";
import { Content } from "./Content";

export type SectionRole = "regularIcon" | "sectionTitleIcon" | "default" | "sectionIcon";

export interface Schema {
    id: string;
    type: string;
    tag: string;
    /** @deprecated Field labels live in Content.prop.title. */
    name?: string;
    role?: SectionRole;
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

export type Section = Omit<SectionDB, 'user'> & { user?: Pick<UserDB, 'email' | 'isAdmin'> };
