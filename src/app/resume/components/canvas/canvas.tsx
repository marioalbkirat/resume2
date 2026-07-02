"use client"
import BuildLayout from "@/hooks/Canava/BuildLayout";
export default function Canava() {
    const { selectedResume, layout, settings } = useResumeBuilder();
    const sections = [
        {
            "id": "cmq9jk3e4000jt9gc9zn6tfpq",
            "name": "Achievements",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "d1bd58f4-627e-4598-8705-9dee9d5c0ef2",
                "tag": "section",
                "name": "Achievements",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "7616a2f5-f1cc-4b98-a40f-0ea8106d834b",
                        "tag": "h2",
                        "name": "Achievements_heading",
                        "type": "heading",
                        "value": "Achievements",
                        "children": [
                            {
                                "id": "908cd33d-30a3-4b6b-be85-5ebca71906db",
                                "tag": 'i',
                                "name": "Achievements_icon",
                                "type": "icon",
                                "value": "FaTrophy",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "085aea49-adce-4abc-896b-24417c3deac2",
                        "tag": "ul",
                        "name": "list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "863329bd-5cb5-4a51-afaa-4b0b8e7dbcaa",
                                "tag": "li",
                                "name": "list_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "df69d66c-05d1-4364-b3c6-55414204e05f",
                                        "tag": "span",
                                        "name": "label",
                                        "type": "text",
                                        "value": "50+",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "6d9d01e7-c968-4622-b445-f51edbb2bf2c",
                                        "tag": "span",
                                        "name": "value",
                                        "type": "text",
                                        "value": "Design Projects Completed",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:36:36.652Z",
            "updatedAt": "2026-06-11T13:36:36.652Z"
        },
        {
            "id": "cmq9ji67r000ht9gcig0gr5tg",
            "name": "Certifications",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "302849a7-d3df-476f-b83b-aad285ee955a",
                "tag": "section",
                "name": "Certifications",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "1d81a8da-b05d-49f5-9730-f0b6818ee59a",
                        "tag": "h2",
                        "name": "Certifications_heading",
                        "type": "heading",
                        "value": "Certifications",
                        "children": [
                            {
                                "id": "9d6dc2ed-1059-48d4-b1ab-d2e33733c36a",
                                "tag": 'i',
                                "name": "Certifications_icon",
                                "type": "icon",
                                "value": "FaCertificate",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "8bb462fe-1197-47a2-bb6a-6f8a136b63cd",
                        "tag": "ul",
                        "name": "list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "40519ea2-06b9-4ecf-9976-0097eb84c454",
                                "tag": "li",
                                "name": "list_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "e43cc1bb-27ab-4aae-a4d7-0757d2ff889a",
                                        "tag": "span",
                                        "name": "name",
                                        "type": "text",
                                        "value": "UI/UX Design Certification",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "bbf96b66-19d0-4382-8e82-240e76f3fcce",
                                        "tag": "span",
                                        "name": "issuer",
                                        "type": "text",
                                        "value": "Interaction Design Foundation",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "388ccd13-3995-42a4-bfb0-feec01785be3",
                                        "tag": "span",
                                        "name": "date",
                                        "type": "text",
                                        "value": "2022",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "cfa743fe-d475-4fdd-9b21-00daa6cb627e",
                                        "tag": "a",
                                        "name": "link",
                                        "type": "link",
                                        "value": "View Certificate",
                                        "children": [],
                                        "selectorGroup": "a"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:35:06.970Z",
            "updatedAt": "2026-06-11T13:35:06.970Z"
        },
        {
            "id": "cmq9jfo3i000ft9gc2ezu11vj",
            "name": "Volunteering",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "e29f0d01-9129-46bd-ba96-304cc6f35315",
                "tag": "section",
                "name": "Volunteering",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "3dfdad12-a6d2-48e8-9631-ed10b615889d",
                        "tag": "h2",
                        "name": "Volunteering_heading",
                        "type": "heading",
                        "value": "Volunteering",
                        "children": [
                            {
                                "id": "38f8d17e-3333-4747-8f92-317ce360b288",
                                "tag": 'i',
                                "name": "Volunteering_icon",
                                "type": "icon",
                                "value": "FaUsers",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "97e09aa5-04db-470c-851c-23a19f3299b3",
                        "tag": "ul",
                        "name": "items",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "ddae4ff9-bb6b-43f1-9846-761ed643bab5",
                                "tag": "li",
                                "name": "items_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "222427b4-66e7-4b67-b88e-ea113603a02c",
                                        "tag": "span",
                                        "name": "role",
                                        "type": "text",
                                        "value": "Design Mentor",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "322b1907-b6a9-44ce-abcb-d6c67960900b",
                                        "tag": "span",
                                        "name": "organization",
                                        "type": "text",
                                        "value": "Design for Good",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "36a29817-1a6d-479a-8339-3176a255f89f",
                                        "tag": "span",
                                        "name": "date",
                                        "type": "text",
                                        "value": "2020 - Present",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "cb26106d-30d2-4664-b84f-fca3fb8b8a47",
                                        "tag": "span",
                                        "name": "description",
                                        "type": "text",
                                        "value": "Mentoring aspiring designers and providing guidance on design projects that have a positive social impact.",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "93e65638-bc80-4b2c-8e15-8c98c77ea183",
                                        "tag": "span",
                                        "name": "location",
                                        "type": "text",
                                        "value": "London",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "924793ec-07a7-4f3f-ac15-302c7ddc5f6e",
                                        "tag": "a",
                                        "name": "link",
                                        "type": "link",
                                        "value": "View Profile",
                                        "children": [],
                                        "selectorGroup": "a"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:33:10.206Z",
            "updatedAt": "2026-06-11T13:33:10.206Z"
        },
        {
            "id": "cmq9jbm6t000dt9gc0tr0r2v5",
            "name": "projects",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "dc4450e2-81b3-4ea2-83fa-8218789d86f7",
                "tag": "section",
                "name": "projects",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "de31249a-5c35-4db1-ae68-0d9ab7497202",
                        "tag": "h2",
                        "name": "projects_heading",
                        "type": "heading",
                        "value": "projects",
                        "children": [
                            {
                                "id": "15638c8b-6605-46ce-9b32-cca4f95d40b9",
                                "tag": 'i',
                                "name": "projects",
                                "type": "icon",
                                "value": "FaFolderOpen",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "63fac5bd-6b5e-4e38-8474-068d390b730e",
                        "tag": "ul",
                        "name": "projects_list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "65c9428d-beab-4cb9-94e0-dc2ed2aa3440",
                                "tag": "li",
                                "name": "projects_list_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "6d59b03f-c6f5-42f9-b558-bc68160ff5c4",
                                        "tag": "span",
                                        "name": "name",
                                        "type": "text",
                                        "value": "TaskFlow - Productivity App",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "35537b77-508f-4851-a439-19e7573c3f3c",
                                        "tag": "span",
                                        "name": "description",
                                        "type": "text",
                                        "value": "Designed the UI/UX for a productivity app, focusing on task management and collaboration, with intuitive dashboards and engaging interactions.",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "d038ce3f-a2f1-4fa1-8d5c-aef726062499",
                                        "tag": "a",
                                        "name": "link",
                                        "type": "link",
                                        "value": "title",
                                        "children": [],
                                        "selectorGroup": "a"
                                    },
                                    {
                                        "id": "b2363141-514d-4716-8ca7-39a465cf3048",
                                        "tag": "ul",
                                        "name": "tech_list",
                                        "type": "list",
                                        "value": "",
                                        "children": [
                                            {
                                                "id": "d09f4328-fa24-4dad-9dae-8d66b800c6d7",
                                                "tag": "li",
                                                "name": "tech_list_item",
                                                "type": "listItem",
                                                "value": "",
                                                "children": [
                                                    {
                                                        "id": "9c8096de-71be-41b9-a83e-6f8fab624bb8",
                                                        "tag": "span",
                                                        "name": "name",
                                                        "type": "text",
                                                        "value": "Figma / Sketch",
                                                        "children": [],
                                                        "selectorGroup": "span"
                                                    }
                                                ],
                                                "selectorGroup": "li"
                                            }
                                        ],
                                        "selectorGroup": "ul"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:30:00.978Z",
            "updatedAt": "2026-06-11T13:30:00.978Z"
        },
        {
            "id": "cmq9j7uv8000bt9gcw4y0fhq7",
            "name": "languages",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "29bbf70d-8774-4297-8be4-5340be582bdc",
                "tag": "section",
                "name": "languages",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "3f147ec5-226f-43b9-81bf-3cd86d481020",
                        "tag": "h2",
                        "name": "languages",
                        "type": "heading",
                        "value": "languages",
                        "children": [
                            {
                                "id": "b49d01c4-10be-46dc-9e63-51f4179d5fc5",
                                "tag": 'i',
                                "name": "languages_icon",
                                "type": "icon",
                                "value": "FaGlobe",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "a396f423-6987-4264-a12a-eab7c06f3afd",
                        "tag": "ul",
                        "name": "list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "7d33dbc7-5706-4f96-bbbf-f8513f8a429c",
                                "tag": "li",
                                "name": "list_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "7b7d3817-7fb9-4d49-8b13-7a66fbdcc8fb",
                                        "tag": "span",
                                        "name": "lang",
                                        "type": "text",
                                        "value": "english",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "9245028c-1fb3-489e-a909-11d58edb9f88",
                                        "tag": "span",
                                        "name": "level",
                                        "type": "text",
                                        "value": "native",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:27:05.732Z",
            "updatedAt": "2026-06-11T13:27:05.732Z"
        },
        {
            "id": "cmq9j4lqe0007t9gcs708oyuh",
            "name": "education",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "72511f7a-1069-44ae-b3ba-21e524b3875e",
                "tag": "section",
                "name": "education",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "15e8bb2f-b7c0-4cdd-9695-180b6a749272",
                        "tag": "h2",
                        "name": "education_heading",
                        "type": "heading",
                        "value": "education",
                        "children": [
                            {
                                "id": "23778aab-ef8a-40b6-adf5-74be7ae09cdd",
                                "tag": 'i',
                                "name": "education_icon",
                                "type": "icon",
                                "value": "FaGraduationCap",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "3c2daabd-220f-4a8d-9aa7-01edf1fa0fbb",
                        "tag": "ul",
                        "name": "education_list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "46bd12c3-af7d-4a42-8f4a-4185f43abbbe",
                                "tag": "li",
                                "name": "education_list_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "5ec36bda-42b3-4e46-ae64-11426ed71709",
                                        "tag": "span",
                                        "name": "university",
                                        "type": "text",
                                        "value": "Technical University of Berlin",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "b27ab852-aa54-4454-a986-385db1d87935",
                                        "tag": "span",
                                        "name": "major",
                                        "type": "text",
                                        "value": "Bachelor of Arts in Visual Communication - GPA 3.9\"",
                                        "children": [],
                                        "selectorGroup": "span"
                                    },
                                    {
                                        "id": "8924c50f-b8ef-4ddd-9e72-13b98f673079",
                                        "tag": "span",
                                        "name": "date",
                                        "type": "text",
                                        "value": "2015 - 2019",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:24:33.899Z",
            "updatedAt": "2026-06-11T13:24:33.899Z"
        },
        {
            "id": "cmq9j0zhu0005t9gcygf5bac4",
            "name": "image",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "425a7685-da64-492e-a448-3f06064e0c7b",
                "tag": "section",
                "name": "image",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "348c5c22-2257-420d-9b9a-ec54d7064222",
                        "tag": "img",
                        "name": "image",
                        "type": "image",
                        "value": "/images/user-photo.avif",
                        "children": [],
                        "selectorGroup": "img"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:21:45.138Z",
            "updatedAt": "2026-06-11T13:21:45.138Z"
        },
        {
            "id": "cmq9j0ea40003t9gczt8blfix",
            "name": "profile",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "9ce4d4c7-b87a-406d-8b70-de97946160d7",
                "tag": "section",
                "name": "profile",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "5fdfcfdd-45d7-4146-87ec-626484b1db7d",
                        "tag": "h2",
                        "name": "title",
                        "type": "heading",
                        "value": "Profile",
                        "children": [
                            {
                                "id": "59c1f72c-1cfc-4ba1-bfff-0dbe4ffac09d",
                                "tag": 'i',
                                "name": "icon",
                                "type": "icon",
                                "value": "FaUser",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "9b8790e3-711a-4bc1-84b4-2de9cc1882e1",
                        "tag": "p",
                        "name": "summary",
                        "type": "paragraph",
                        "value": "I transform ideas into visually compelling and user-friendly digital experiences. With a passion for design and an eye for detail, I specialize in creating intuitive interfaces, engaging user experiences, and aesthetically pleasing digital products that leave a lasting impression.",
                        "children": [],
                        "selectorGroup": "p"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:21:17.644Z",
            "updatedAt": "2026-06-11T13:21:17.644Z"
        },
        {
            "id": "cmq9iyubt0001t9gcjb4h1uq1",
            "name": "header",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "4287e4e0-8156-4e25-844f-ea47d27b0983",
                "tag": "section",
                "name": "header",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "9d4c75d9-ffdb-4960-832d-293e4c00409a",
                        "tag": "h1",
                        "name": "name",
                        "type": "heading",
                        "value": "Daniel Carter",
                        "children": [],
                        "selectorGroup": "h1"
                    },
                    {
                        "id": "03131ec3-5e37-4427-9844-fcdfdd9eda74",
                        "tag": "h2",
                        "name": "position",
                        "type": "heading",
                        "value": "UI/UX & Visual Designer",
                        "children": [],
                        "selectorGroup": "h2"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:20:05.126Z",
            "updatedAt": "2026-06-11T13:20:05.126Z"
        },
        {
            "id": "cmq9j688r0009t9gc93fh4447",
            "name": "skills",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "f0089892-852c-4839-a5b8-17cf59670b89",
                "tag": "section",
                "name": "skills",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "58b8c41f-2b5c-4dc8-a8b9-f66383dd95d3",
                        "tag": "h2",
                        "name": "skills_heading",
                        "type": "heading",
                        "value": "skills",
                        "children": [
                            {
                                "id": "3f222364-12b0-4ae2-8473-e426c9873d26",
                                "tag": 'i',
                                "name": "skills_icon",
                                "type": "icon",
                                "value": "FaDesktop",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "a58f7771-c408-4a19-aaae-9a27c7890774",
                        "tag": "ul",
                        "name": "items",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "08cb18da-0838-42c8-8b7f-3e63ca04bca9",
                                "tag": "li",
                                "name": "items_li",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "323a16a7-ee11-4895-9fa4-7e697715e223",
                                        "tag": "span",
                                        "name": "name",
                                        "type": "text",
                                        "value": "Adobe Photoshop",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-11T13:25:49.755Z",
            "updatedAt": "2026-06-11T13:25:49.755Z"
        },
        {
            "id": "cmq8qb1420005t99s030uxo58",
            "name": "experience",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "051bd982-80a1-4915-9b65-5909c6bf8d70",
                "tag": "section",
                "name": "experience",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "4b9e54be-9de5-466c-ae8c-81432063b8ba",
                        "tag": "h2",
                        "name": "experience_heading",
                        "type": "heading",
                        "value": "experience",
                        "children": [
                            {
                                "id": "23863d21-9507-4886-87b2-1d735847bebd",
                                "tag": 'i',
                                "name": "experience_icon",
                                "type": "icon",
                                "value": "FaBriefcase",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "d4b0bc9e-a178-4eab-8e94-56271d9f7c56",
                        "tag": "ul",
                        "name": "experience_list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "aebddf74-2636-4269-8892-fac7dccc6770",
                                "tag": "li",
                                "name": "position_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "531209b3-6a8e-45e8-b98e-5b19ef60cb10",
                                        "tag": "h3",
                                        "name": "position",
                                        "type": "heading",
                                        "value": "web developer",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            },
                            {
                                "id": "a26e9c3b-5fa8-477a-aeef-4184477c0f31",
                                "tag": "li",
                                "name": "company_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "6d929628-528a-46cf-8d2e-21825e0bf705",
                                        "tag": "span",
                                        "name": "company",
                                        "type": "text",
                                        "value": "TechNova Solutions",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            },
                            {
                                "id": "4affe5b7-6349-4d6c-96f0-36784521eccf",
                                "tag": "li",
                                "name": "date_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "da9c043e-a7c2-48c2-a25f-6bdd7dee3fa7",
                                        "tag": "span",
                                        "name": "date_item",
                                        "type": "text",
                                        "value": "2021 - Present",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            },
                            {
                                "id": "d64b82e3-0a12-4758-9a4d-a68068efd698",
                                "tag": "li",
                                "name": "description_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "307d8d7a-5d95-4a86-b052-26d8c69e4a2d",
                                        "tag": "span",
                                        "name": "description",
                                        "type": "text",
                                        "value": "Designed and delivered engaging user interfaces and digital experiences for web and mobile platforms. Collaborated with product managers and developers to ensure visually appealing and user-friendly solutions.",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-10T23:57:44.929Z",
            "updatedAt": "2026-06-10T23:57:44.929Z"
        },
        {
            "id": "cmq8q4t540003t99s653q533d",
            "name": "contact",
            "target": "RESUME",
            "visibility": "OFFICIAL",
            "authorId": "cmpyqq2340002t9f40gyhidc2",
            "schema": {
                "id": "fd817d4e-ee85-4768-afda-7c31125d792b",
                "tag": "section",
                "name": "contact",
                "type": "section",
                "value": "",
                "children": [
                    {
                        "id": "0e2649a1-491b-47d6-82bc-d8b8ef5d1441",
                        "tag": "h2",
                        "name": "contact_heading",
                        "type": "heading",
                        "value": "contact",
                        "children": [
                            {
                                "id": "fa98a984-58ff-4915-ae37-66e4c0a51650",
                                "tag": 'i',
                                "name": "contact_icon",
                                "type": "icon",
                                "value": "FaUser",
                                "children": [],
                                "selectorGroup": 'i'
                            }
                        ],
                        "selectorGroup": "h2"
                    },
                    {
                        "id": "ca1e20e4-8cba-4ec9-a0bf-23aea583ffcf",
                        "tag": "ul",
                        "name": "contact_list",
                        "type": "list",
                        "value": "",
                        "children": [
                            {
                                "id": "9da31aeb-918c-41f5-a5b8-c667b1d7c0e1",
                                "tag": "li",
                                "name": "contact_list_item",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "645b3714-6cea-49f4-b7e3-ded9232f0e23",
                                        "tag": "span",
                                        "name": "phone",
                                        "type": "text",
                                        "value": "+123456789",
                                        "children": [],
                                        "selectorGroup": "span"
                                    }
                                ],
                                "selectorGroup": "li"
                            },
                            {
                                "id": "ebb7e16f-5edd-4fac-bbb6-f3ffa134dcc2",
                                "tag": "li",
                                "name": "email",
                                "type": "listItem",
                                "value": "",
                                "children": [
                                    {
                                        "id": "0d17f837-4b0b-433c-9a15-aba4af72a766",
                                        "tag": "a",
                                        "name": "email",
                                        "type": "link",
                                        "value": "user@email.com",
                                        "children": [],
                                        "selectorGroup": "a"
                                    }
                                ],
                                "selectorGroup": "li"
                            }
                        ],
                        "selectorGroup": "ul"
                    }
                ],
                "selectorGroup": "section"
            },
            "createdAt": "2026-06-10T23:52:54.632Z",
            "updatedAt": "2026-06-10T23:52:54.632Z"
        }
    ]
    if (!selectedResume) return <div>no</div>
    const style = selectedResume?.styles;
    return <BuildLayout settings={settings} layout={layout} sections={sections} style={style} />
}
/**
 * content
 * style
 * settings
 * distribution
 */