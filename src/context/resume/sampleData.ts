// D:\cvBuilder\resumebuilder\src\context\resume\sampleData.ts
import { Schema, Section } from '@/types/resume/Section';
import { Settings } from '@/types/resume/Settings';
import { Distribution } from '@/types/resume/Distribution';
import { Content } from '@/types/resume/Content';

// Helper function to create schema nodes
const createSchema = (id: string, tag: string, type: string, name: string, children: Schema[] = [], value?: string): Schema => ({
    id,
    tag,
    type,
    name,
    selectorGroup: tag,
    children,
    value: value || ''
} as Schema);

// Sample Content - All in English
export const sampleContent: Record<string, Content> = {
    // Header
    'content-header-name': {
        id: 'content-header-name',
        type: 'heading',
        value: 'John Doe'
    },
    'content-header-title': {
        id: 'content-header-title',
        type: 'text',
        value: 'Senior Full Stack Developer'
    },
    'content-header-email': {
        id: 'content-header-email',
        type: 'text',
        value: 'john.doe@email.com'
    },
    'content-header-phone': {
        id: 'content-header-phone',
        type: 'text',
        value: '+1 (555) 123-4567'
    },
    'content-header-location': {
        id: 'content-header-location',
        type: 'text',
        value: 'San Francisco, CA'
    },
    'content-header-linkedin': {
        id: 'content-header-linkedin',
        type: 'icon',
        value: 'FaLinkedin'
    },
    'content-header-linkedin-text': {
        id: 'content-header-linkedin-text',
        type: 'text',
        value: 'linkedin.com/in/johndoe'
    },
    'content-header-github': {
        id: 'content-header-github',
        type: 'icon',
        value: 'FaGithub'
    },
    'content-header-github-text': {
        id: 'content-header-github-text',
        type: 'text',
        value: 'github.com/johndoe'
    },

    // About / Summary
    'content-about-title': {
        id: 'content-about-title',
        type: 'heading',
        value: 'About Me'
    },
    'content-about-text': {
        id: 'content-about-text',
        type: 'paragraph',
        value: 'Experienced Full Stack Developer with 5+ years of building web applications using React, Next.js, and Node.js. Passionate about creating exceptional user experiences and solving complex technical challenges.'
    },

    // Experience
    'content-experience-title': {
        id: 'content-experience-title',
        type: 'heading',
        value: 'Professional Experience'
    },
    'content-experience-1-title': {
        id: 'content-experience-1-title',
        type: 'heading',
        value: 'Senior Full Stack Developer'
    },
    'content-experience-1-company': {
        id: 'content-experience-1-company',
        type: 'text',
        value: 'Tech Corp'
    },
    'content-experience-1-date': {
        id: 'content-experience-1-date',
        type: 'text',
        value: '2021 - Present'
    },
    'content-experience-1-desc': {
        id: 'content-experience-1-desc',
        type: 'paragraph',
        value: 'Leading the web development team, designing and implementing interactive user interfaces, improving application performance by 40%.'
    },
    'content-experience-2-title': {
        id: 'content-experience-2-title',
        type: 'heading',
        value: 'Full Stack Developer'
    },
    'content-experience-2-company': {
        id: 'content-experience-2-company',
        type: 'text',
        value: 'Digital Solutions Inc'
    },
    'content-experience-2-date': {
        id: 'content-experience-2-date',
        type: 'text',
        value: '2019 - 2021'
    },
    'content-experience-2-desc': {
        id: 'content-experience-2-desc',
        type: 'paragraph',
        value: 'Built web applications using React and Redux, developed APIs with Node.js and Express, and implemented CI/CD pipelines.'
    },
    'content-experience-3-title': {
        id: 'content-experience-3-title',
        type: 'heading',
        value: 'Web Developer Intern'
    },
    'content-experience-3-company': {
        id: 'content-experience-3-company',
        type: 'text',
        value: 'Startup Tech'
    },
    'content-experience-3-date': {
        id: 'content-experience-3-date',
        type: 'text',
        value: '2018 - 2019'
    },
    'content-experience-3-desc': {
        id: 'content-experience-3-desc',
        type: 'paragraph',
        value: 'Participated in developing web projects, learned modern technologies including React and TypeScript.'
    },

    // Education
    'content-education-title': {
        id: 'content-education-title',
        type: 'heading',
        value: 'Education'
    },
    'content-education-1-degree': {
        id: 'content-education-1-degree',
        type: 'heading',
        value: 'B.S. Computer Science'
    },
    'content-education-1-school': {
        id: 'content-education-1-school',
        type: 'text',
        value: 'Stanford University'
    },
    'content-education-1-date': {
        id: 'content-education-1-date',
        type: 'text',
        value: '2014 - 2018'
    },
    'content-education-1-gpa': {
        id: 'content-education-1-gpa',
        type: 'text',
        value: 'GPA: 3.8/4.0'
    },

    // Skills
    'content-skills-title': {
        id: 'content-skills-title',
        type: 'heading',
        value: 'Technical Skills'
    },
    'content-skills-1': {
        id: 'content-skills-1',
        type: 'text',
        value: 'React.js / Next.js'
    },
    'content-skills-2': {
        id: 'content-skills-2',
        type: 'text',
        value: 'TypeScript / JavaScript'
    },
    'content-skills-3': {
        id: 'content-skills-3',
        type: 'text',
        value: 'Node.js / Express'
    },
    'content-skills-4': {
        id: 'content-skills-4',
        type: 'text',
        value: 'MongoDB / PostgreSQL'
    },
    'content-skills-5': {
        id: 'content-skills-5',
        type: 'text',
        value: 'Docker / AWS'
    },
    'content-skills-6': {
        id: 'content-skills-6',
        type: 'text',
        value: 'Git / GitHub'
    },

    // Languages
    'content-languages-title': {
        id: 'content-languages-title',
        type: 'heading',
        value: 'Languages'
    },
    'content-languages-1': {
        id: 'content-languages-1',
        type: 'text',
        value: 'English (Native)'
    },
    'content-languages-2': {
        id: 'content-languages-2',
        type: 'text',
        value: 'Spanish (Fluent)'
    },
    'content-languages-3': {
        id: 'content-languages-3',
        type: 'text',
        value: 'French (Intermediate)'
    },

    // Certifications
    'content-certifications-title': {
        id: 'content-certifications-title',
        type: 'heading',
        value: 'Certifications'
    },
    'content-certifications-1': {
        id: 'content-certifications-1',
        type: 'text',
        value: 'AWS Certified Solutions Architect'
    },
    'content-certifications-2': {
        id: 'content-certifications-2',
        type: 'text',
        value: 'Google Professional Cloud Architect'
    },
    'content-certifications-3': {
        id: 'content-certifications-3',
        type: 'text',
        value: 'Meta Frontend Developer Certification'
    },

    // Projects
    'content-projects-title': {
        id: 'content-projects-title',
        type: 'heading',
        value: 'Projects'
    },
    'content-projects-1': {
        id: 'content-projects-1',
        type: 'text',
        value: 'E-Commerce Platform'
    },
    'content-projects-2': {
        id: 'content-projects-2',
        type: 'text',
        value: 'Learning Management System'
    },
    'content-projects-3': {
        id: 'content-projects-3',
        type: 'text',
        value: 'Real-time Chat Application'
    }
};

// Sample Sections
export const sampleSections: Section[] = ([
    {
        id: 'section-header',
        name: 'Header',
        schema: createSchema('sec-header', 'section', 'section', 'Header', [
            createSchema('sec-header-name', 'h1', 'heading', 'Name', [], 'content-header-name'),
            createSchema('sec-header-title', 'p', 'paragraph', 'Title', [], 'content-header-title'),
            createSchema('sec-header-contact', 'div', 'container', 'Contact Info', [
                createSchema('sec-header-email', 'p', 'text', 'Email', [], 'content-header-email'),
                createSchema('sec-header-phone', 'p', 'text', 'Phone', [], 'content-header-phone'),
                createSchema('sec-header-location', 'p', 'text', 'Location', [], 'content-header-location'),
                createSchema('sec-header-linkedin', 'div', 'container', 'LinkedIn', [
                    createSchema('sec-header-linkedin-icon', 'i', 'icon', 'Icon', [], 'content-header-linkedin'),
                    createSchema('sec-header-linkedin-text', 'a', 'link', 'Link', [], 'content-header-linkedin-text')
                ]),
                createSchema('sec-header-github', 'div', 'container', 'GitHub', [
                    createSchema('sec-header-github-icon', 'i', 'icon', 'Icon', [], 'content-header-github'),
                    createSchema('sec-header-github-text', 'a', 'link', 'Link', [], 'content-header-github-text')
                ])
            ])
        ])
    },
    {
        id: 'section-about',
        name: 'About',
        schema: createSchema('sec-about', 'section', 'section', 'About', [
            createSchema('sec-about-title', 'h2', 'heading', 'About Title', [], 'content-about-title'),
            createSchema('sec-about-text', 'p', 'paragraph', 'About Text', [], 'content-about-text')
        ])
    },
    {
        id: 'section-experience',
        name: 'Experience',
        schema: createSchema('sec-exp', 'section', 'section', 'Experience', [
            createSchema('sec-exp-title', 'h2', 'heading', 'Experience Title', [], 'content-experience-title'),
            createSchema('sec-exp-job1', 'div', 'container', 'Job 1', [
                createSchema('sec-exp-job1-title', 'h3', 'heading', 'Job Title', [], 'content-experience-1-title'),
                createSchema('sec-exp-job1-company', 'p', 'text', 'Company', [], 'content-experience-1-company'),
                createSchema('sec-exp-job1-date', 'p', 'text', 'Date', [], 'content-experience-1-date'),
                createSchema('sec-exp-job1-desc', 'p', 'paragraph', 'Description', [], 'content-experience-1-desc')
            ]),
            createSchema('sec-exp-job2', 'div', 'container', 'Job 2', [
                createSchema('sec-exp-job2-title', 'h3', 'heading', 'Job Title', [], 'content-experience-2-title'),
                createSchema('sec-exp-job2-company', 'p', 'text', 'Company', [], 'content-experience-2-company'),
                createSchema('sec-exp-job2-date', 'p', 'text', 'Date', [], 'content-experience-2-date'),
                createSchema('sec-exp-job2-desc', 'p', 'paragraph', 'Description', [], 'content-experience-2-desc')
            ]),
            createSchema('sec-exp-job3', 'div', 'container', 'Job 3', [
                createSchema('sec-exp-job3-title', 'h3', 'heading', 'Job Title', [], 'content-experience-3-title'),
                createSchema('sec-exp-job3-company', 'p', 'text', 'Company', [], 'content-experience-3-company'),
                createSchema('sec-exp-job3-date', 'p', 'text', 'Date', [], 'content-experience-3-date'),
                createSchema('sec-exp-job3-desc', 'p', 'paragraph', 'Description', [], 'content-experience-3-desc')
            ])
        ])
    },
    {
        id: 'section-education',
        name: 'Education',
        schema: createSchema('sec-edu', 'section', 'section', 'Education', [
            createSchema('sec-edu-title', 'h2', 'heading', 'Education Title', [], 'content-education-title'),
            createSchema('sec-edu-degree1', 'div', 'container', 'Degree 1', [
                createSchema('sec-edu-degree1-name', 'h3', 'heading', 'Degree Name', [], 'content-education-1-degree'),
                createSchema('sec-edu-degree1-school', 'p', 'text', 'School', [], 'content-education-1-school'),
                createSchema('sec-edu-degree1-date', 'p', 'text', 'Date', [], 'content-education-1-date'),
                createSchema('sec-edu-degree1-gpa', 'p', 'text', 'GPA', [], 'content-education-1-gpa')
            ])
        ])
    },
    {
        id: 'section-skills',
        name: 'Skills',
        schema: createSchema('sec-skills', 'section', 'section', 'Skills', [
            createSchema('sec-skills-title', 'h2', 'heading', 'Skills Title', [], 'content-skills-title'),
            createSchema('sec-skills-ul', 'ul', 'list', 'Skills List', [
                createSchema('sec-skills-li-1', 'li', 'listItem', 'Skill 1', [], 'content-skills-1'),
                createSchema('sec-skills-li-2', 'li', 'listItem', 'Skill 2', [], 'content-skills-2'),
                createSchema('sec-skills-li-3', 'li', 'listItem', 'Skill 3', [], 'content-skills-3'),
                createSchema('sec-skills-li-4', 'li', 'listItem', 'Skill 4', [], 'content-skills-4'),
                createSchema('sec-skills-li-5', 'li', 'listItem', 'Skill 5', [], 'content-skills-5'),
                createSchema('sec-skills-li-6', 'li', 'listItem', 'Skill 6', [], 'content-skills-6')
            ])
        ])
    },
    {
        id: 'section-languages',
        name: 'Languages',
        schema: createSchema('sec-langs', 'section', 'section', 'Languages', [
            createSchema('sec-langs-title', 'h2', 'heading', 'Languages Title', [], 'content-languages-title'),
            createSchema('sec-langs-ul', 'ul', 'list', 'Languages List', [
                createSchema('sec-langs-li-1', 'li', 'listItem', 'Language 1', [], 'content-languages-1'),
                createSchema('sec-langs-li-2', 'li', 'listItem', 'Language 2', [], 'content-languages-2'),
                createSchema('sec-langs-li-3', 'li', 'listItem', 'Language 3', [], 'content-languages-3')
            ])
        ])
    },
    {
        id: 'section-certifications',
        name: 'Certifications',
        schema: createSchema('sec-cert', 'section', 'section', 'Certifications', [
            createSchema('sec-cert-title', 'h2', 'heading', 'Certifications Title', [], 'content-certifications-title'),
            createSchema('sec-cert-ul', 'ul', 'list', 'Certifications List', [
                createSchema('sec-cert-li-1', 'li', 'listItem', 'Cert 1', [], 'content-certifications-1'),
                createSchema('sec-cert-li-2', 'li', 'listItem', 'Cert 2', [], 'content-certifications-2'),
                createSchema('sec-cert-li-3', 'li', 'listItem', 'Cert 3', [], 'content-certifications-3')
            ])
        ])
    },
    {
        id: 'section-projects',
        name: 'Projects',
        schema: createSchema('sec-proj', 'section', 'section', 'Projects', [
            createSchema('sec-proj-title', 'h2', 'heading', 'Projects Title', [], 'content-projects-title'),
            createSchema('sec-proj-ul', 'ul', 'list', 'Projects List', [
                createSchema('sec-proj-li-1', 'li', 'listItem', 'Project 1', [], 'content-projects-1'),
                createSchema('sec-proj-li-2', 'li', 'listItem', 'Project 2', [], 'content-projects-2'),
                createSchema('sec-proj-li-3', 'li', 'listItem', 'Project 3', [], 'content-projects-3')
            ])
        ])
    }
] as unknown as Section[]);

// Sample Settings
export const sampleSettings: Settings = {
    columns: "TWO",
    sidebar: {
        position: "LEFT"
    },
    direction: "LTR",
    pageSize: "A4",
    showIcons: true,
    fileName: "My_Resume"
};

// Sample Distribution
export const sampleDistribution: Distribution = {
    'section-header': {
        order: 0,
        position: "FULL",
        visible: true,
        showIcon: true
    },
    'section-about': {
        order: 1,
        position: "FULL",
        visible: true,
        showIcon: true
    },
    'section-experience': {
        order: 2,
        position: "FULL",
        visible: true,
        showIcon: true
    },
    'section-skills': {
        order: 3,
        position: "left",
        visible: true,
        showIcon: true
    },
    'section-languages': {
        order: 4,
        position: "left",
        visible: true,
        showIcon: true
    },
    'section-education': {
        order: 5,
        position: "right",
        visible: true,
        showIcon: true
    },
    'section-certifications': {
        order: 6,
        position: "right",
        visible: true,
        showIcon: true
    },
    'section-projects': {
        order: 7,
        position: "right",
        visible: true,
        showIcon: true
    }
};
export const sampleStyle = {
    global: {},
    selectors: {},
    elements: {}
};
