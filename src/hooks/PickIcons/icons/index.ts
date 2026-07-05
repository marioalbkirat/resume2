import type { IconType } from "react-icons";

export type IconPack = "fa" | "si" | "io5" | "io" | "tb" | "bi" | "pi" | "bs" | "md" | "fa6" | "di" | "vsc" | "gr";

export interface IconItem {
    name: string;
    pack: IconPack;
    displayName: string;
}

export type LoadedIconItem = IconItem & {
    component: IconType;
};
export const ALL_ICONS: IconItem[] = [
    // Mobile Development
    { name: "FaFlutter", pack: "fa6", displayName: "Flutter" },
    { name: "TbBrandReactNative", pack: "tb", displayName: "React Native" },
    { name: "TbBrandXamarin", pack: "tb", displayName: "Xamarin" },
    { name: "FaAndroid", pack: "fa", displayName: "Android" },
    { name: "FaApple", pack: "fa", displayName: "iOS/Apple" },

    // Backend & Frameworks
    { name: "DiMsqlServer", pack: "di", displayName: "MS SQL Server" },
    { name: "DiDjango", pack: "di", displayName: "Django" },
    { name: "BiLogoFlask", pack: "bi", displayName: "Flask" },
    { name: "SiBlazor", pack: "si", displayName: "Blazor" },
    { name: "SiRubyonrails", pack: "si", displayName: "Ruby on Rails" },
    { name: "FaPhoenixFramework", pack: "fa", displayName: "Phoenix Framework" },

    // Cloud & DevOps
    { name: "VscAzure", pack: "vsc", displayName: "Azure" },
    { name: "BiLogoNetlify", pack: "bi", displayName: "Netlify" },
    { name: "FaCloudflare", pack: "fa", displayName: "Cloudflare" },
    { name: "SiTerraform", pack: "si", displayName: "Terraform" },
    { name: "SiAnsible", pack: "si", displayName: "Ansible" },
    { name: "SiNginx", pack: "si", displayName: "Nginx" },

    // AI & Machine Learning
    { name: "BsOpenai", pack: "bs", displayName: "OpenAI" },
    { name: "SiTensorflow", pack: "si", displayName: "TensorFlow" },
    { name: "SiPytorch", pack: "si", displayName: "PyTorch" },
    { name: "SiPandas", pack: "si", displayName: "Pandas" },
    { name: "SiNumpy", pack: "si", displayName: "NumPy" },
    { name: "SiScikitlearn", pack: "si", displayName: "Scikit-learn" },

    // Databases
    { name: "GrOracle", pack: "gr", displayName: "Oracle" },
    { name: "SiMariadb", pack: "si", displayName: "MariaDB" },
    { name: "SiElasticsearch", pack: "si", displayName: "Elasticsearch" },

    // Testing
    { name: "SiCypress", pack: "si", displayName: "Cypress" },
    { name: "SiVitest", pack: "si", displayName: "Vitest" },
    { name: "SiMocha", pack: "si", displayName: "Mocha" },
    { name: "SiJunit5", pack: "si", displayName: "JUnit 5" },

    // Operating Systems
    { name: "FaLinux", pack: "fa", displayName: "Linux" },
    { name: "SiPhp", pack: "si", displayName: "PHP" },
    { name: "FaLaravel", pack: "fa", displayName: "Laravel" },
    { name: "FaSymfony ", pack: "fa", displayName: "Symfony" },
    { name: "SiCakephp  ", pack: "si", displayName: "Cakephp" },
    { name: "SiYii  ", pack: "si", displayName: "Yii" },
    { name: "SiCodeigniter ", pack: "si", displayName: "Codeigniter" },
    { name: "SiLivewire ", pack: "si", displayName: "Livewire" },
    { name: "FaDrupal   ", pack: "fa", displayName: "Drupal" },
    { name: "FaWordpress   ", pack: "fa", displayName: "Wordpress" },
    { name: "FaJoomla   ", pack: "fa", displayName: "Joomla" },
    { name: "FaJava", pack: "fa", displayName: "Java" },
    { name: "SiSpring", pack: "si", displayName: "Spring" },
    { name: "SiQuarkus", pack: "si", displayName: "Quarkus" },
    { name: "SiHibernate", pack: "si", displayName: "Hibernate" },
    { name: "IoLogoJavascript", pack: "io", displayName: "JavaScript" },
    { name: "SiExpress", pack: "si", displayName: "Express" },
    { name: "SiNestjs", pack: "si", displayName: "Nest.js" },
    { name: "SiNextdotjs", pack: "si", displayName: "Next.js" },
    { name: "SiReact", pack: "si", displayName: "React" },
    { name: "SiAngular", pack: "si", displayName: "Angular" },
    { name: "SiVuedotjs", pack: "si", displayName: "Vue.js" },
    { name: "SiNodedotjs", pack: "si", displayName: "Node.js" },
    { name: "SiFastify", pack: "si", displayName: "Fastify" },
    { name: "SiKoa", pack: "si", displayName: "Koa" },
    { name: "SiVite", pack: "si", displayName: "Vite" },
    { name: "FaNpm ", pack: "fa", displayName: "Npm " },
    { name: "SiTypescript", pack: "si", displayName: "TypeScript" },
    { name: "SiPython", pack: "si", displayName: "Python" },
    { name: "SiFastapi", pack: "si", displayName: "Fastapi" },
    { name: "SiHtml5", pack: "si", displayName: "HTML5" },
    { name: "FaCss3", pack: "fa", displayName: "CSS3" },
    { name: "SiTailwindcss", pack: "si", displayName: "Tailwind CSS" },
    { name: "SiBootstrap", pack: "si", displayName: "Bootstrap" },
    { name: "SiMongodb", pack: "si", displayName: "MongoDB" },
    { name: "SiMysql", pack: "si", displayName: "MySQL" },
    { name: "SiPostgresql", pack: "si", displayName: "PostgreSQL" },
    { name: "FaDatabase", pack: "fa", displayName: "Database" },
    { name: "SiSqlite", pack: "si", displayName: "Sqlite" },
    { name: "SiRedis", pack: "si", displayName: "Redis" },
    { name: "SiCplusplus", pack: "si", displayName: "Cplusplus" },
    { name: "SiSharp", pack: "si", displayName: "Sharp" },
    { name: "SiRust", pack: "si", displayName: "Rust" },
    { name: "SiKotlin", pack: "si", displayName: "Kotlin" },
    { name: "SiSwift", pack: "si", displayName: "Swift" },
    { name: "FaGolang", pack: "fa6", displayName: "Go lang" },
    { name: "FaGithub", pack: "fa", displayName: "GitHub" },
    { name: "SiGitlab", pack: "si", displayName: "Gitlab" },
    { name: "SiSnapchat", pack: "si", displayName: "Snapchat" },
    { name: "SiReddit", pack: "si", displayName: "Reddit" },
    { name: "SiGooglemeet", pack: "si", displayName: "Googlemeet" },
    { name: "SiZoom", pack: "si", displayName: "Zoom" },
    { name: "SiSlack", pack: "si", displayName: "Slack" },
    { name: "FaLinkedin", pack: "fa", displayName: "LinkedIn" },
    { name: "FaTwitter", pack: "fa", displayName: "Twitter/X" },
    { name: "FaFacebook", pack: "fa", displayName: "Facebook" },
    { name: "FaInstagram", pack: "fa", displayName: "Instagram" },
    { name: "FaBehance", pack: "fa", displayName: "Behance" },
    { name: "SiYoutube", pack: "si", displayName: "YouTube" },
    { name: "SiTiktok", pack: "si", displayName: "TikTok" },
    { name: "SiWhatsapp", pack: "si", displayName: "WhatsApp" },
    { name: "SiTelegram", pack: "si", displayName: "Telegram" },
    { name: "SiDiscord", pack: "si", displayName: "Discord" },
    { name: "FaEnvelope", pack: "fa", displayName: "Email" },
    { name: "SiGmail", pack: "si", displayName: "Gmail" },
    { name: "PiMicrosoftOutlookLogoThin", pack: "pi", displayName: "Outlook" },
    { name: "FaWifi", pack: "fa", displayName: "wifi" },
    { name: "IoColorPaletteOutline", pack: "io5", displayName: "Color Palette" },
    { name: "IoVideocamOutline", pack: "io5", displayName: "Videocam" },
    { name: "BsMicrosoftTeams", pack: "bs", displayName: "MicrosoftTeams" },
    { name: "IoImageOutline", pack: "io5", displayName: "Image" },
    { name: "SiUdacity", pack: "si", displayName: "Udacity" },
    { name: "SiPluralsight", pack: "si", displayName: "Pluralsight" },
    { name: "SiCodeforces", pack: "si", displayName: "Codeforces" },
    { name: "SiHashnode", pack: "si", displayName: "Hashnode" },
    { name: "SiMedium", pack: "si", displayName: "Medium" },
    { name: "SiDevdotto", pack: "si", displayName: "Devdotto" },
    { name: "SiPinterest", pack: "si", displayName: "Pinterest" },
    { name: "SiVimeo", pack: "si", displayName: "Vimeo" },
    { name: "SiWebpack", pack: "si", displayName: "Webpack" },
    { name: "SiJira", pack: "si", displayName: "Jira" },
    { name: "SiRedux", pack: "si", displayName: "Redux" },
    { name: "SiJest", pack: "si", displayName: "Jest" },
    { name: "FaBookOpen", pack: "fa", displayName: "book open" },
    { name: "FaAward", pack: "fa", displayName: "Award" },
    { name: "FaServer", pack: "fa", displayName: "Server" },
    { name: "FaGlobe", pack: "fa", displayName: "Website" },
    { name: "FaPhone", pack: "fa", displayName: "Phone" },
    { name: "FaMapMarkerAlt", pack: "fa", displayName: "Location" },
    { name: "FaCalendarAlt", pack: "fa", displayName: "Calendar" },
    { name: "FaUser", pack: "fa", displayName: "User" },
    { name: "FaBuilding", pack: "fa", displayName: "Company" },
    { name: "FaGraduationCap", pack: "fa", displayName: "Education" },
    { name: "FaTrophy", pack: "fa", displayName: "Award" },
    { name: "FaStar", pack: "fa", displayName: "Star" },
    { name: "FaCertificate", pack: "fa", displayName: "Certificate" },
    { name: "FaFileAlt", pack: "fa", displayName: "Document" },
    { name: "FaBriefcase", pack: "fa", displayName: "Experience" },
    { name: "IoBagOutline", pack: "md", displayName: "Job" },
    { name: "FaFolderOpen", pack: "fa", displayName: "Projects" },
    { name: "FaLink", pack: "fa", displayName: "Link" },
    { name: "FaBullseye", pack: "fa", displayName: "Goal" },
    { name: "SiDocker", pack: "si", displayName: "Docker" },
    { name: "SiKubernetes", pack: "si", displayName: "Kubernetes" },
    { name: "FaAws", pack: "fa", displayName: "AWS" },
    { name: "FaCloud", pack: "fa", displayName: "Cloud" },
    { name: "SiFirebase", pack: "si", displayName: "Firebase" },
    { name: "SiGit", pack: "si", displayName: "Git" },
    { name: "FaCode", pack: "fa", displayName: "Code" },
    { name: "IoCodeSlashOutline", pack: "io5", displayName: "Coding" },
    { name: "SiGraphql", pack: "si", displayName: "GraphQL" },
    { name: "FaFigma", pack: "fa", displayName: "Figma" },
    { name: "BiLogoAdobe", pack: "bi", displayName: "Adobe" },
    { name: "TbBrandAdobeXd", pack: "tb", displayName: "Adobe XD" },
    { name: "TbBrandAdobePhotoshop", pack: "tb", displayName: "Photoshop" },
    { name: "TbBrandAdobeIllustrator", pack: "tb", displayName: "Illustrator" },
    { name: "FaPaintBrush", pack: "fa", displayName: "Design" },
    { name: "FaHeart", pack: "fa", displayName: "Interests" },
    { name: "FaUsers", pack: "fa", displayName: "Teamwork" },
    { name: "FaComments", pack: "fa", displayName: "Communication" },
    { name: "FaClock", pack: "fa", displayName: "Time Management" },
    { name: "FaChartLine", pack: "fa", displayName: "Analytics" },
    { name: "FaLightbulb", pack: "fa", displayName: "Creativity" },
    { name: "FaLaptopCode", pack: "fa", displayName: "Development" },
    { name: "IoLaptopOutline", pack: "io5", displayName: "Dev" },
    { name: "FaBook", pack: "fa", displayName: "Learning" },
    { name: "SiCoursera", pack: "si", displayName: "Coursera" },
    { name: "SiUdemy", pack: "si", displayName: "Udemy" },
    { name: "SiCodecademy", pack: "si", displayName: "Codecademy" },
    { name: "SiLeetcode", pack: "si", displayName: "LeetCode" },
    { name: "SiHackerrank", pack: "si", displayName: "HackerRank" },
    { name: "SiCodepen", pack: "si", displayName: "CodePen" },
    { name: "SiCodesandbox", pack: "si", displayName: "CodeSandbox" },
    { name: "SiStackoverflow", pack: "si", displayName: "Stack Overflow" },
    { name: "FaSearch", pack: "fa", displayName: "Search" },
    { name: "FaPlus", pack: "fa", displayName: "Add" },
    { name: "FaMinus", pack: "fa", displayName: "Remove" },
    { name: "FaEdit", pack: "fa", displayName: "Edit" },
    { name: "FaTrash", pack: "fa", displayName: "Delete" },
    { name: "FaSave", pack: "fa", displayName: "Save" },
    { name: "FaDownload", pack: "fa", displayName: "Download" },
    { name: "FaUpload", pack: "fa", displayName: "Upload" },
    { name: "FaPrint", pack: "fa", displayName: "Print" },
    { name: "FaShare", pack: "fa", displayName: "Share" },
    { name: "FaLock", pack: "fa", displayName: "Security" },
    { name: "IoLockOpenOutline", pack: "io5", displayName: "open lock" },
    { name: "FaShieldAlt", pack: "fa", displayName: "Protection" },
    { name: "FaCamera", pack: "fa", displayName: "Camera" },
    { name: "FaImage", pack: "fa", displayName: "Image" },
    { name: "FaVideo", pack: "fa", displayName: "Video" },
    { name: "FaMusic", pack: "fa", displayName: "Music" },
    { name: "FaMobile", pack: "fa", displayName: "Mobile" },
    { name: "FaTablet", pack: "fa", displayName: "Tablet" },
    { name: "FaDesktop", pack: "fa", displayName: "Desktop" },
    { name: "FaShoppingCart", pack: "fa", displayName: "Shopping" },
    { name: "FaCreditCard", pack: "fa", displayName: "Payment" },
    { name: "FaDollarSign", pack: "fa", displayName: "Money" },
];
export const ICON_PACK_BY_NAME = Object.fromEntries(
    ALL_ICONS.map(icon => [icon.name, icon.pack])
) as Record<string, IconPack>;


const ICON_COMPONENT_NAME_OVERRIDES: Record<string, string> = {
    "IoBagOutline": "MdOutlineWork",
};

export const ICON_COMPONENT_NAME_BY_NAME = Object.fromEntries(
    ALL_ICONS.map(icon => [icon.name, ICON_COMPONENT_NAME_OVERRIDES[icon.name] ?? icon.name.trim()])
) as Record<string, string>;

export const ICON_METADATA_BY_NAME = Object.fromEntries(
    ALL_ICONS.map(icon => [icon.name, icon])
) as Record<string, IconItem>;

export const getIconMetadata = (icon: string) => ICON_METADATA_BY_NAME[icon];

export const searchIcons = (searchTerm: string): IconItem[] => {
    if (!searchTerm.trim()) return ALL_ICONS;
    const term = searchTerm.toLowerCase();
    return ALL_ICONS.filter(icon =>
        icon.displayName.toLowerCase().includes(term) ||
        icon.name.toLowerCase().includes(term)
    );
};
