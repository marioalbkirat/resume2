import { Draft } from "./Draft";
import { PublishedResumeDB } from "./PublishedResume";
import { ResumeTemplateDB } from "./ResumeTemplate";
import { SectionDB } from "./Section";

export interface UserDB {
    id: string;
    email?: string | null;
    isAdmin: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    drafts?: Draft[];
    publishedResume?: PublishedResumeDB[];
    resumeTemplates?: ResumeTemplateDB[];
    sections?: SectionDB[];
}
export type User = Omit<UserDB, 'drafts' | 'publishedResume' | 'resumeTemplates' | 'sections'>;