// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\componenets\UpdateNode.tsx

import { Schema } from '@/types/resume/Section';
import { FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useSectionBuilder } from '../useSectionBuilder';

export default function UpdateNode({ 
    node, 
    builder 
}: { 
    node: Schema; 
    builder: ReturnType<typeof useSectionBuilder>;
}) {
    const { updateNode, getTagsWithoutValue, getContent, updateContent } = builder;
    
    const FIXED_NAME_TYPES = ['container', 'list', 'listItem', 'image', 'icon', 'link'];
    const USER_NAME_TYPES = ['heading', 'text', 'paragraph'];

    const typeOptions: Record<string, { label: string; icon: string; color: string; defaultTag: string }> = {
        heading: { label: 'Heading', icon: 'H', color: 'bg-blue-50', defaultTag: 'h2' },
        text: { label: 'Text', icon: 'T', color: 'bg-gray-50', defaultTag: 'span' },
        paragraph: { label: 'Paragraph', icon: '¶', color: 'bg-gray-50', defaultTag: 'p' },
        image: { label: 'Image', icon: '🖼', color: 'bg-green-50', defaultTag: 'img' },
        icon: { label: 'Icon', icon: '⭐', color: 'bg-yellow-50', defaultTag: 'i' },
        list: { label: 'List', icon: '📋', color: 'bg-indigo-50', defaultTag: 'ul' },
        listItem: { label: 'List Item', icon: '•', color: 'bg-indigo-50', defaultTag: 'li' },
        section: { label: 'Section', icon: '📁', color: 'bg-purple-50', defaultTag: 'section' },
        container: { label: 'Container', icon: '📦', color: 'bg-teal-50', defaultTag: 'div' },
        link: { label: 'Link', icon: '🔗', color: 'bg-teal-50', defaultTag: 'a' },
    };

    const showForm = async () => {
        const tagsWithoutValue = getTagsWithoutValue();
        const currentType = node.type;
        const info = typeOptions[currentType];
        const content = getContent(node.id);
        
        let displayValue = content?.value || '';
        if (currentType === 'image' && !displayValue) {
            displayValue = '/images/user-photo.avif';
        }
        if (currentType === 'link' && !displayValue) {
            displayValue = 'https://example.com|Link Text';
        }

        const showValue = !tagsWithoutValue.includes(node.tag) && currentType !== 'icon';

        const htmlContent = `
            <div style="text-align: left; direction: ltr;">
                <div style="margin-bottom: 16px; padding: 10px; background: #eff6ff; border-radius: 8px; font-size: 14px; color: #1e40af;">
                    ✏️ Updating: <strong>${node.name}</strong> (${node.tag})
                </div>

                <div id="name-container" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                        Name ${USER_NAME_TYPES.includes(currentType) ? '<span style="color: #ef4444;">*</span>' : ''}
                    </label>
                    <input type="text" id="swal-name" 
                        style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px; ${FIXED_NAME_TYPES.includes(currentType) ? 'background-color: #f3f4f6; color: #6b7280;' : ''}"
                        value="${node.name}"
                        ${FIXED_NAME_TYPES.includes(currentType) ? 'disabled' : ''}
                    />
                    <div id="name-error" style="font-size: 12px; color: #ef4444; margin-top: 4px;"></div>
                </div>

                ${currentType === 'heading' ? `
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">HTML Tag</label>
                        <select id="swal-tag" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; box-sizing: border-box; font-size: 14px;">
                            <option value="h1" ${node.tag === 'h1' ? 'selected' : ''}>h1</option>
                            <option value="h2" ${node.tag === 'h2' ? 'selected' : ''}>h2</option>
                            <option value="h3" ${node.tag === 'h3' ? 'selected' : ''}>h3</option>
                            <option value="h4" ${node.tag === 'h4' ? 'selected' : ''}>h4</option>
                            <option value="h5" ${node.tag === 'h5' ? 'selected' : ''}>h5</option>
                            <option value="h6" ${node.tag === 'h6' ? 'selected' : ''}>h6</option>
                        </select>
                    </div>
                ` : ''}

                ${showValue ? `
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                            Value ${currentType === 'image' || currentType === 'link' ? '<span style="color: #10b981; font-size: 12px;">(auto)</span>' : '<span style="color: #9ca3af; font-size: 12px;">(optional)</span>'}
                        </label>
                        <input type="text" id="swal-value" 
                            style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px; ${currentType === 'image' || currentType === 'link' ? 'background-color: #f3f4f6; color: #6b7280;' : ''}"
                            value="${displayValue}"
                            ${currentType === 'image' || currentType === 'link' ? 'disabled' : ''}
                        />
                    </div>
                ` : ''}
            </div>
        `;

        const result = await Swal.fire({
            title: 'Update Element',
            html: htmlContent,
            width: '650px',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '✓ Update',
            cancelButtonText: '✗ Cancel',
            showCloseButton: true,
            didOpen: () => {
                const nameInput = document.getElementById('swal-name') as HTMLInputElement;
                const validateName = () => {
                    const name = nameInput?.value.trim();
                    const errorDiv = document.getElementById('name-error');
                    if (USER_NAME_TYPES.includes(currentType) && !name) {
                        errorDiv!.textContent = '⚠️ Name is required';
                        nameInput!.style.borderColor = '#ef4444';
                        nameInput!.style.backgroundColor = '#fef2f2';
                        return false;
                    } else {
                        errorDiv!.textContent = '';
                        nameInput!.style.borderColor = '#d1d5db';
                        nameInput!.style.backgroundColor = USER_NAME_TYPES.includes(currentType) ? 'white' : '#f3f4f6';
                        return true;
                    }
                };
                nameInput?.addEventListener('input', validateName);

                const confirmButton = document.querySelector('.swal2-confirm') as HTMLElement;
                confirmButton?.addEventListener('click', (e) => {
                    if (USER_NAME_TYPES.includes(currentType)) {
                        const name = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
                        if (!name) {
                            e.preventDefault();
                            Swal.showValidationMessage('⚠️ Name is required!');
                        }
                    }
                });
            },
            preConfirm: () => {
                let name = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
                let value = (document.getElementById('swal-value') as HTMLInputElement)?.value || '';
                let tag = (document.getElementById('swal-tag') as HTMLSelectElement)?.value || node.tag;

                if (FIXED_NAME_TYPES.includes(currentType)) {
                    name = currentType;
                }

                if (currentType === 'image') {
                    value = '/images/user-photo.avif';
                }

                if (currentType === 'link') {
                    value = 'https://example.com|Link Text';
                }

                if (tagsWithoutValue.includes(tag) || currentType === 'icon') {
                    value = '';
                }

                if (USER_NAME_TYPES.includes(currentType) && !name) {
                    Swal.showValidationMessage('⚠️ Name is required!');
                    return false;
                }

                return { name, value, tag };
            }
        });

        if (result.isConfirmed && result.value) {
            const { name, value, tag } = result.value;
            
            // تحديث الـ Schema
            updateNode(node.id, tag, name);
            
            // تحديث الـ Content إذا كان هناك قيمة
            if (value !== undefined) {
                updateContent(node.id, value);
            }
        }
    };

    return (
        <button
            onClick={showForm}
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer group"
            title="Update element"
        >
            <FiEdit2 size={14} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}