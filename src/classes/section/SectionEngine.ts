import { SectionTarget, Visibility } from "@prisma/client";
import { SectionSchema } from "./SectionSchema";
import { SectionContent } from "./SectionContent";
export class SectionEngine {
    private id?: string;
    private name: string;
    private target: SectionTarget;
    private visibility: Visibility;
    private authorId?: string;
    public schema: SectionSchema;
    public content: SectionContent;
    private createdAt?: Date;
    private updatedAt?: Date;
    constructor(name: string, target: SectionTarget, visibility: Visibility = "COMMUNITY", authorId?: string) {
        this.name = name;
        this.target = target;
        this.visibility = visibility;
        this.authorId = authorId;
        this.schema = new SectionSchema();
        this.content = new SectionContent();
    }
    getName(): string {
        return this.name;
    }
    getId(): string | null | undefined {
        return this.id;
    }
    getTarget(): SectionTarget {
        return this.target;
    }
    getVisibility(): Visibility {
        return this.visibility;
    }
    getAuthorId(): string | undefined {
        return this.authorId;
    }
    setName(name: string): void {
        this.name = name;
    }
    setTarget(target: SectionTarget): void {
        this.target = target;
    }
    setVisibility(visibility: Visibility): void {
        this.visibility = visibility;
    }
    setAuthorId(authorId: string): void {
        this.authorId = authorId;
    }
}