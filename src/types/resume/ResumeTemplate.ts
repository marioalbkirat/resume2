
import { ResumeCategory, Visibility } from "@prisma/client";
import { Draft } from "./Draft";
import { UserDB } from "./User";
import { TemplateDownloadDB } from "./TemplateDownload";
import { TemplateForkDB } from "./TemplateFork";
import { TemplateSaveDB } from "./TemplateSave";
import { TemplateLikeDB } from "./TemplateLike";
import { Settings } from "./Settings";
import { Distribution } from "./Distribution";
import { ResumeStyle } from "./ResumeStyle";
import { Content } from "./Content";
export interface ResumeTemplateDB {
    id: string;
    name: string;
    visibility: Visibility;
    previewImage: string;
    targetRoles: string[];
    description: string;
    category: ResumeCategory,
    settings: Settings;
    distribution: Distribution;
    style: ResumeStyle;
    downloads: number;
    content: Content;
    likes: number;
    views: number;
    saves: number;
    forks: number;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    drafts: Draft[];
    user: UserDB;
    templateLikes: TemplateLikeDB[];
    templateSaves: TemplateSaveDB[];
    templateDownloads: TemplateDownloadDB[];
    templateForks: TemplateForkDB[];
}
export type ResumeTemplate = Omit<ResumeTemplateDB, 'templateForks' | 'templateLikes' | 'templateSaves' | 'templateDownloads' | 'user' | 'drafts'>;