import { IconType } from "react-icons";
import {
    FaGithub, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaBehance, FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaBuilding, FaGraduationCap, FaTrophy,
    FaCertificate, FaBriefcase, FaFolderOpen, FaLink, FaBullseye, FaCode, FaHeart, FaUsers, FaComments, FaClock, FaChartLine, FaLightbulb, FaLaptopCode, FaDatabase, FaServer, FaCloud,
    FaShieldAlt, FaPaintBrush, FaFigma, FaFileAlt, FaDownload, FaUpload, FaSearch, FaPlus, FaMinus, FaEdit, FaTrash, FaSave, FaPrint, FaShare, FaStar, FaAward, FaBook, FaBookOpen,
    FaVideo, FaMusic, FaCamera, FaImage, FaMobile, FaTablet, FaDesktop, FaWifi, FaLock, FaLaravel, FaShoppingCart, FaCreditCard, FaDollarSign, FaJava, FaAws, FaCss3, FaSymfony,
    FaDrupal, FaWordpress, FaJoomla, FaNpm, FaAndroid, FaApple, FaCloudflare, FaPhoenixFramework, FaLinux
} from "react-icons/fa";
import {
    SiNextdotjs, SiTypescript, SiPython, SiPhp, SiReact, SiAngular, SiVuedotjs, SiNodedotjs, SiHtml5, SiTailwindcss, SiBootstrap, SiMongodb, SiMysql, SiPostgresql, SiDocker,
    SiKubernetes, SiFirebase, SiGit, SiGraphql, SiRedux, SiJest, SiWebpack, SiVite, SiJira, SiSlack, SiZoom, SiGooglemeet, SiGmail, SiWhatsapp, SiTelegram, SiDiscord,
    SiYoutube, SiVimeo, SiTiktok, SiPinterest, SiSnapchat, SiReddit, SiMedium, SiDevdotto, SiHashnode, SiStackoverflow, SiCodepen, SiCodesandbox, SiCodeforces, SiLeetcode,
    SiHackerrank, SiCodecademy, SiCoursera, SiUdemy, SiUdacity, SiPluralsight, SiCodeigniter, SiYii, SiCakephp, SiLivewire, SiExpress, SiNestjs, SiFastify, SiKoa, SiSpring, SiQuarkus,
    SiHibernate, SiCplusplus, SiSharp, SiRust, SiKotlin, SiSwift, SiFastapi, SiRedis, SiSqlite, SiGitlab, SiBlazor, SiTensorflow, SiPytorch, SiPandas, SiNumpy, SiScikitlearn,
    SiCypress, SiVitest, SiMocha, SiJunit5, SiMariadb, SiElasticsearch, SiRubyonrails, SiTerraform, SiAnsible, SiNginx
} from "react-icons/si";
import { IoCodeSlashOutline, IoLaptopOutline, IoColorPaletteOutline, IoVideocamOutline, IoImageOutline, IoLockOpenOutline } from "react-icons/io5";
import { IoLogoJavascript } from "react-icons/io";
import { TbBrandAdobeIllustrator, TbBrandAdobePhotoshop, TbBrandAdobeXd, TbBrandReactNative, TbBrandXamarin } from "react-icons/tb";
import { BiLogoAdobe, BiLogoNetlify, BiLogoFlask } from "react-icons/bi";
import { PiMicrosoftOutlookLogoThin } from "react-icons/pi";
import { BsMicrosoftTeams, BsOpenai } from "react-icons/bs";
import { MdOutlineWork } from "react-icons/md";
import { FaFlutter, FaGolang } from "react-icons/fa6";
import { DiMsqlServer, DiDjango } from "react-icons/di";
import { VscAzure } from "react-icons/vsc";
import { GrOracle } from "react-icons/gr";
export interface IconItem {
    name: string;
    component: IconType;
    displayName: string;
}
export const ALL_ICONS: IconItem[] = [
    // Mobile Development
    { name: "FaFlutter", component: FaFlutter, displayName: "Flutter" },
    { name: "TbBrandReactNative", component: TbBrandReactNative, displayName: "React Native" },
    { name: "TbBrandXamarin", component: TbBrandXamarin, displayName: "Xamarin" },
    { name: "FaAndroid", component: FaAndroid, displayName: "Android" },
    { name: "FaApple", component: FaApple, displayName: "iOS/Apple" },

    // Backend & Frameworks
    { name: "DiMsqlServer", component: DiMsqlServer, displayName: "MS SQL Server" },
    { name: "DiDjango", component: DiDjango, displayName: "Django" },
    { name: "BiLogoFlask", component: BiLogoFlask, displayName: "Flask" },
    { name: "SiBlazor", component: SiBlazor, displayName: "Blazor" },
    { name: "SiRubyonrails", component: SiRubyonrails, displayName: "Ruby on Rails" },
    { name: "FaPhoenixFramework", component: FaPhoenixFramework, displayName: "Phoenix Framework" },

    // Cloud & DevOps
    { name: "VscAzure", component: VscAzure, displayName: "Azure" },
    { name: "BiLogoNetlify", component: BiLogoNetlify, displayName: "Netlify" },
    { name: "FaCloudflare", component: FaCloudflare, displayName: "Cloudflare" },
    { name: "SiTerraform", component: SiTerraform, displayName: "Terraform" },
    { name: "SiAnsible", component: SiAnsible, displayName: "Ansible" },
    { name: "SiNginx", component: SiNginx, displayName: "Nginx" },

    // AI & Machine Learning
    { name: "BsOpenai", component: BsOpenai, displayName: "OpenAI" },
    { name: "SiTensorflow", component: SiTensorflow, displayName: "TensorFlow" },
    { name: "SiPytorch", component: SiPytorch, displayName: "PyTorch" },
    { name: "SiPandas", component: SiPandas, displayName: "Pandas" },
    { name: "SiNumpy", component: SiNumpy, displayName: "NumPy" },
    { name: "SiScikitlearn", component: SiScikitlearn, displayName: "Scikit-learn" },

    // Databases
    { name: "GrOracle", component: GrOracle, displayName: "Oracle" },
    { name: "SiMariadb", component: SiMariadb, displayName: "MariaDB" },
    { name: "SiElasticsearch", component: SiElasticsearch, displayName: "Elasticsearch" },

    // Testing
    { name: "SiCypress", component: SiCypress, displayName: "Cypress" },
    { name: "SiVitest", component: SiVitest, displayName: "Vitest" },
    { name: "SiMocha", component: SiMocha, displayName: "Mocha" },
    { name: "SiJunit5", component: SiJunit5, displayName: "JUnit 5" },

    // Operating Systems
    { name: "FaLinux", component: FaLinux, displayName: "Linux" },
    { name: "SiPhp", component: SiPhp, displayName: "PHP" },
    { name: "FaLaravel", component: FaLaravel, displayName: "Laravel" },
    { name: "FaSymfony ", component: FaSymfony, displayName: "Symfony" },
    { name: "SiCakephp  ", component: SiCakephp, displayName: "Cakephp" },
    { name: "SiYii  ", component: SiYii, displayName: "Yii" },
    { name: "SiCodeigniter ", component: SiCodeigniter, displayName: "Codeigniter" },
    { name: "SiLivewire ", component: SiLivewire, displayName: "Livewire" },
    { name: "FaDrupal   ", component: FaDrupal, displayName: "Drupal" },
    { name: "FaWordpress   ", component: FaWordpress, displayName: "Wordpress" },
    { name: "FaJoomla   ", component: FaJoomla, displayName: "Joomla" },
    { name: "FaJava", component: FaJava, displayName: "Java" },
    { name: "SiSpring", component: SiSpring, displayName: "Spring" },
    { name: "SiQuarkus", component: SiQuarkus, displayName: "Quarkus" },
    { name: "SiHibernate", component: SiHibernate, displayName: "Hibernate" },
    { name: "IoLogoJavascript", component: IoLogoJavascript, displayName: "JavaScript" },
    { name: "SiExpress", component: SiExpress, displayName: "Express" },
    { name: "SiNestjs", component: SiNestjs, displayName: "Nest.js" },
    { name: "SiNextdotjs", component: SiNextdotjs, displayName: "Next.js" },
    { name: "SiReact", component: SiReact, displayName: "React" },
    { name: "SiAngular", component: SiAngular, displayName: "Angular" },
    { name: "SiVuedotjs", component: SiVuedotjs, displayName: "Vue.js" },
    { name: "SiNodedotjs", component: SiNodedotjs, displayName: "Node.js" },
    { name: "SiFastify", component: SiFastify, displayName: "Fastify" },
    { name: "SiKoa", component: SiKoa, displayName: "Koa" },
    { name: "SiVite", component: SiVite, displayName: "Vite" },
    { name: "FaNpm ", component: FaNpm, displayName: "Npm " },
    { name: "SiTypescript", component: SiTypescript, displayName: "TypeScript" },
    { name: "SiPython", component: SiPython, displayName: "Python" },
    { name: "SiFastapi", component: SiFastapi, displayName: "Fastapi" },
    { name: "SiHtml5", component: SiHtml5, displayName: "HTML5" },
    { name: "FaCss3", component: FaCss3, displayName: "CSS3" },
    { name: "SiTailwindcss", component: SiTailwindcss, displayName: "Tailwind CSS" },
    { name: "SiBootstrap", component: SiBootstrap, displayName: "Bootstrap" },
    { name: "SiMongodb", component: SiMongodb, displayName: "MongoDB" },
    { name: "SiMysql", component: SiMysql, displayName: "MySQL" },
    { name: "SiPostgresql", component: SiPostgresql, displayName: "PostgreSQL" },
    { name: "FaDatabase", component: FaDatabase, displayName: "Database" },
    { name: "SiSqlite", component: SiSqlite, displayName: "Sqlite" },
    { name: "SiRedis", component: SiRedis, displayName: "Redis" },
    { name: "SiCplusplus", component: SiCplusplus, displayName: "Cplusplus" },
    { name: "SiSharp", component: SiSharp, displayName: "Sharp" },
    { name: "SiRust", component: SiRust, displayName: "Rust" },
    { name: "SiKotlin", component: SiKotlin, displayName: "Kotlin" },
    { name: "SiSwift", component: SiSwift, displayName: "Swift" },
    { name: "FaGolang", component: FaGolang, displayName: "Go lang" },
    { name: "FaGithub", component: FaGithub, displayName: "GitHub" },
    { name: "SiGitlab", component: SiGitlab, displayName: "Gitlab" },
    { name: "SiSnapchat", component: SiSnapchat, displayName: "Snapchat" },
    { name: "SiReddit", component: SiReddit, displayName: "Reddit" },
    { name: "SiGooglemeet", component: SiGooglemeet, displayName: "Googlemeet" },
    { name: "SiZoom", component: SiZoom, displayName: "Zoom" },
    { name: "SiSlack", component: SiSlack, displayName: "Slack" },
    { name: "FaLinkedin", component: FaLinkedin, displayName: "LinkedIn" },
    { name: "FaTwitter", component: FaTwitter, displayName: "Twitter/X" },
    { name: "FaFacebook", component: FaFacebook, displayName: "Facebook" },
    { name: "FaInstagram", component: FaInstagram, displayName: "Instagram" },
    { name: "FaBehance", component: FaBehance, displayName: "Behance" },
    { name: "SiYoutube", component: SiYoutube, displayName: "YouTube" },
    { name: "SiTiktok", component: SiTiktok, displayName: "TikTok" },
    { name: "SiWhatsapp", component: SiWhatsapp, displayName: "WhatsApp" },
    { name: "SiTelegram", component: SiTelegram, displayName: "Telegram" },
    { name: "SiDiscord", component: SiDiscord, displayName: "Discord" },
    { name: "FaEnvelope", component: FaEnvelope, displayName: "Email" },
    { name: "SiGmail", component: SiGmail, displayName: "Gmail" },
    { name: "PiMicrosoftOutlookLogoThin", component: PiMicrosoftOutlookLogoThin, displayName: "Outlook" },
    { name: "FaWifi", component: FaWifi, displayName: "wifi" },
    { name: "IoColorPaletteOutline", component: IoColorPaletteOutline, displayName: "Color Palette" },
    { name: "IoVideocamOutline", component: IoVideocamOutline, displayName: "Videocam" },
    { name: "BsMicrosoftTeams", component: BsMicrosoftTeams, displayName: "MicrosoftTeams" },
    { name: "IoImageOutline", component: IoImageOutline, displayName: "Image" },
    { name: "SiUdacity", component: SiUdacity, displayName: "Udacity" },
    { name: "SiPluralsight", component: SiPluralsight, displayName: "Pluralsight" },
    { name: "SiCodeforces", component: SiCodeforces, displayName: "Codeforces" },
    { name: "SiHashnode", component: SiHashnode, displayName: "Hashnode" },
    { name: "SiMedium", component: SiMedium, displayName: "Medium" },
    { name: "SiDevdotto", component: SiDevdotto, displayName: "Devdotto" },
    { name: "SiPinterest", component: SiPinterest, displayName: "Pinterest" },
    { name: "SiVimeo", component: SiVimeo, displayName: "Vimeo" },
    { name: "SiWebpack", component: SiWebpack, displayName: "Webpack" },
    { name: "SiJira", component: SiJira, displayName: "Jira" },
    { name: "SiRedux", component: SiRedux, displayName: "Redux" },
    { name: "SiJest", component: SiJest, displayName: "Jest" },
    { name: "FaBookOpen", component: FaBookOpen, displayName: "book open" },
    { name: "FaAward", component: FaAward, displayName: "Award" },
    { name: "FaServer", component: FaServer, displayName: "Server" },
    { name: "FaGlobe", component: FaGlobe, displayName: "Website" },
    { name: "FaPhone", component: FaPhone, displayName: "Phone" },
    { name: "FaMapMarkerAlt", component: FaMapMarkerAlt, displayName: "Location" },
    { name: "FaCalendarAlt", component: FaCalendarAlt, displayName: "Calendar" },
    { name: "FaUser", component: FaUser, displayName: "User" },
    { name: "FaBuilding", component: FaBuilding, displayName: "Company" },
    { name: "FaGraduationCap", component: FaGraduationCap, displayName: "Education" },
    { name: "FaTrophy", component: FaTrophy, displayName: "Award" },
    { name: "FaStar", component: FaStar, displayName: "Star" },
    { name: "FaCertificate", component: FaCertificate, displayName: "Certificate" },
    { name: "FaFileAlt", component: FaFileAlt, displayName: "Document" },
    { name: "FaBriefcase", component: FaBriefcase, displayName: "Experience" },
    { name: "IoBagOutline", component: MdOutlineWork, displayName: "Job" },
    { name: "FaFolderOpen", component: FaFolderOpen, displayName: "Projects" },
    { name: "FaLink", component: FaLink, displayName: "Link" },
    { name: "FaBullseye", component: FaBullseye, displayName: "Goal" },
    { name: "SiDocker", component: SiDocker, displayName: "Docker" },
    { name: "SiKubernetes", component: SiKubernetes, displayName: "Kubernetes" },
    { name: "FaAws", component: FaAws, displayName: "AWS" },
    { name: "FaCloud", component: FaCloud, displayName: "Cloud" },
    { name: "SiFirebase", component: SiFirebase, displayName: "Firebase" },
    { name: "SiGit", component: SiGit, displayName: "Git" },
    { name: "FaCode", component: FaCode, displayName: "Code" },
    { name: "IoCodeSlashOutline", component: IoCodeSlashOutline, displayName: "Coding" },
    { name: "SiGraphql", component: SiGraphql, displayName: "GraphQL" },
    { name: "FaFigma", component: FaFigma, displayName: "Figma" },
    { name: "BiLogoAdobe", component: BiLogoAdobe, displayName: "Adobe" },
    { name: "TbBrandAdobeXd", component: TbBrandAdobeXd, displayName: "Adobe XD" },
    { name: "TbBrandAdobePhotoshop", component: TbBrandAdobePhotoshop, displayName: "Photoshop" },
    { name: "TbBrandAdobeIllustrator", component: TbBrandAdobeIllustrator, displayName: "Illustrator" },
    { name: "FaPaintBrush", component: FaPaintBrush, displayName: "Design" },
    { name: "FaHeart", component: FaHeart, displayName: "Interests" },
    { name: "FaUsers", component: FaUsers, displayName: "Teamwork" },
    { name: "FaComments", component: FaComments, displayName: "Communication" },
    { name: "FaClock", component: FaClock, displayName: "Time Management" },
    { name: "FaChartLine", component: FaChartLine, displayName: "Analytics" },
    { name: "FaLightbulb", component: FaLightbulb, displayName: "Creativity" },
    { name: "FaLaptopCode", component: FaLaptopCode, displayName: "Development" },
    { name: "IoLaptopOutline", component: IoLaptopOutline, displayName: "Dev" },
    { name: "FaBook", component: FaBook, displayName: "Learning" },
    { name: "SiCoursera", component: SiCoursera, displayName: "Coursera" },
    { name: "SiUdemy", component: SiUdemy, displayName: "Udemy" },
    { name: "SiCodecademy", component: SiCodecademy, displayName: "Codecademy" },
    { name: "SiLeetcode", component: SiLeetcode, displayName: "LeetCode" },
    { name: "SiHackerrank", component: SiHackerrank, displayName: "HackerRank" },
    { name: "SiCodepen", component: SiCodepen, displayName: "CodePen" },
    { name: "SiCodesandbox", component: SiCodesandbox, displayName: "CodeSandbox" },
    { name: "SiStackoverflow", component: SiStackoverflow, displayName: "Stack Overflow" },
    { name: "FaSearch", component: FaSearch, displayName: "Search" },
    { name: "FaPlus", component: FaPlus, displayName: "Add" },
    { name: "FaMinus", component: FaMinus, displayName: "Remove" },
    { name: "FaEdit", component: FaEdit, displayName: "Edit" },
    { name: "FaTrash", component: FaTrash, displayName: "Delete" },
    { name: "FaSave", component: FaSave, displayName: "Save" },
    { name: "FaDownload", component: FaDownload, displayName: "Download" },
    { name: "FaUpload", component: FaUpload, displayName: "Upload" },
    { name: "FaPrint", component: FaPrint, displayName: "Print" },
    { name: "FaShare", component: FaShare, displayName: "Share" },
    { name: "FaLock", component: FaLock, displayName: "Security" },
    { name: "IoLockOpenOutline", component: IoLockOpenOutline, displayName: "open lock" },
    { name: "FaShieldAlt", component: FaShieldAlt, displayName: "Protection" },
    { name: "FaCamera", component: FaCamera, displayName: "Camera" },
    { name: "FaImage", component: FaImage, displayName: "Image" },
    { name: "FaVideo", component: FaVideo, displayName: "Video" },
    { name: "FaMusic", component: FaMusic, displayName: "Music" },
    { name: "FaMobile", component: FaMobile, displayName: "Mobile" },
    { name: "FaTablet", component: FaTablet, displayName: "Tablet" },
    { name: "FaDesktop", component: FaDesktop, displayName: "Desktop" },
    { name: "FaShoppingCart", component: FaShoppingCart, displayName: "Shopping" },
    { name: "FaCreditCard", component: FaCreditCard, displayName: "Payment" },
    { name: "FaDollarSign", component: FaDollarSign, displayName: "Money" },
];
export const ICON_MAP = Object.fromEntries(
    ALL_ICONS.map(icon => [icon.name, icon.component])
);
export const getIcon = (icon: string) => {
    return ICON_MAP[icon];
}
export const searchIcons = (searchTerm: string): IconItem[] => {
    if (!searchTerm.trim()) return ALL_ICONS;
    const term = searchTerm.toLowerCase();
    return ALL_ICONS.filter(icon =>
        icon.displayName.toLowerCase().includes(term) ||
        icon.name.toLowerCase().includes(term)
    );
};