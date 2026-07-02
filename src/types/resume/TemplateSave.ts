import { ResumeTemplateDB } from "./ResumeTemplate";
import { UserDB } from "./User";
export interface TemplateSaveDB {
    userId: string;
    templateId: string;
    createdAt: Date;
    user: UserDB;
    template: ResumeTemplateDB;
}