import { ResumeTemplateDB } from "./ResumeTemplate";
import { UserDB } from "./User";
export interface TemplateLikeDB {
    userId: string;
    templateId: string;
    createdAt: Date;
    user: UserDB;
    template: ResumeTemplateDB;
}