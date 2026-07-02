import { ResumeTemplateDB } from "./ResumeTemplate";
import { User } from "./User";
import { Content } from "./Content";
import { Settings } from "./Settings";
import { ResumeStyle } from "./ResumeStyle";
import { Distribution } from "./Distribution";
export interface DraftDB {
    id: string;
    userId: string;
    templateId: string;
    title: string;
    content: Content;
    style: ResumeStyle;
    settings: Settings;
    distribution: Distribution;
    isPinned: boolean;
    isDownloaded: boolean;
    isLinkedWithPortfolio: boolean;
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    template: ResumeTemplateDB;
}
export type Draft = Omit<DraftDB, 'user' | 'template'>;