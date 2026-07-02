// D:\cvBuilder\resumebuilder\src\classes\section\SectionContent.ts
import { Content } from "@/types/resume/Content";

export class SectionContent {
    /**
     * إنشاء محتوى جديد
     */
    createContent(content: Record<string, Content>, nodeId: string, type: string, value: string = '', props?: Record<string, string>): Record<string, Content> {
        // التحقق من عدم وجود محتوى مكرر
        if (content[nodeId]) return content;

        const newContent: Content = {
            id: nodeId,
            type: type,
            value: value,
            prop: props || {},
        };
        
        return {
            ...content,
            [nodeId]: newContent
        };
    }

    /**
     * الحصول على محتوى بواسطة ID
     */
    getContent(content: Record<string, Content>, nodeId: string): Content | null {
        return content[nodeId] || null;
    }

    /**
     * تحديث قيمة المحتوى
     */
    updateContentValue(content: Record<string, Content>, nodeId: string, value: string): Record<string, Content> {
        if (!content[nodeId]) return content;
        
        return {
            ...content,
            [nodeId]: {
                ...content[nodeId],
                value: value
            }
        };
    }

    /**
     * تحديث خصائص المحتوى
     */
    updateContentProps(content: Record<string, Content>, nodeId: string, props: Record<string, string>): Record<string, Content> {
        if (!content[nodeId]) return content;
        
        return {
            ...content,
            [nodeId]: {
                ...content[nodeId],
                prop: { ...content[nodeId].prop, ...props }
            }
        };
    }

    /**
     * حذف محتوى بواسطة ID
     */
    deleteContent(content: Record<string, Content>, nodeId: string): Record<string, Content> {
        const newContent = { ...content };
        delete newContent[nodeId];
        return newContent;
    }

    /**
     * الحصول على كل المحتوى
     */
    getAllContent(content: Record<string, Content>): Record<string, Content> {
        return content;
    }

    /**
     * الحصول على المحتوى الافتراضي حسب النوع
     */
    getDefaultContent(type: string): { value: string; props: Record<string, string> } {
        const defaults: Record<string, { value: string; props: Record<string, string> }> = {
            image: {
                value: '/images/user-photo.avif',
                props: { src: '/images/user-photo.avif', alt: 'Image' }
            },
            link: {
                value: 'Link Text',
                props: { href: 'https://example.com' }
            },
            icon: {
                value: 'FaUser',
                props: {}
            },
            heading: {
                value: 'Heading Text',
                props: {}
            },
            text: {
                value: 'Text content',
                props: {}
            },
            paragraph: {
                value: 'Paragraph content',
                props: {}
            },
            list: {
                value: '',
                props: {}
            },
            listItem: {
                value: '',
                props: {}
            },
            container: {
                value: '',
                props: {}
            },
            section: {
                value: '',
                props: {}
            }
        };
        return defaults[type] || { value: '', props: {} };
    }

    /**
     * التحقق مما إذا كان العنصر يحتوي على قيمة
     */
    hasValue(tag: string): boolean {
        const tagsWithoutValue = ['section', 'div', 'li', 'ul'];
        return !tagsWithoutValue.includes(tag);
    }

    /**
     * تحويل Record إلى Array (للتوافق مع بعض الأماكن)
     */
    toArray(content: Record<string, Content>): Content[] {
        return Object.values(content);
    }

    /**
     * تحويل Array إلى Record
     */
    fromArray(contentArray: Content[]): Record<string, Content> {
        const record: Record<string, Content> = {};
        contentArray.forEach(item => {
            record[item.id] = item;
        });
        return record;
    }
}