// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\componenets\UpdateNode.tsx

import { Schema } from '@/types/resume/Section';
import { FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useSectionBuilder } from '../useSectionBuilder';
import { SectionValidation } from '@/classes/section/SectionValidation';
import { createRoot, Root } from 'react-dom/client';
import { useRef, type ComponentType } from 'react';
import type { IconItem } from '@/hooks/PickIcons/icons';
import { getIconMetadata } from '@/hooks/PickIcons/icons';

const validation = new SectionValidation();

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
    const iconRootRef = useRef<Root | null>(null);
    const IconSelectorRef = useRef<ComponentType<{ onSelect: (icon: IconItem) => void; selectedIcon?: IconItem | null; className?: string; }> | null>(null);
    const selectedIconValueRef = useRef<string>('FaUser');

    const loadIconSelector = async () => {
        const myModule = await import('@/hooks/PickIcons/icons/PickIcons');
        IconSelectorRef.current = myModule.default;
        return true;
    };

    const showForm = async () => {
        const tagsWithoutValue = getTagsWithoutValue();
        const currentType = node.type;
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
                    ✏️ Updating: <strong>${content?.prop?.title || node.type}</strong> (${node.tag})
                </div>

                <div id="name-container" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                        Name ${USER_NAME_TYPES.includes(currentType) ? '<span style="color: #ef4444;">*</span>' : ''}
                    </label>
                    <input type="text" id="swal-name" 
                        style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px; ${FIXED_NAME_TYPES.includes(currentType) ? 'background-color: #f3f4f6; color: #6b7280;' : ''}"
                        value="${content?.prop?.title || node.type}"
                        ${FIXED_NAME_TYPES.includes(currentType) ? 'disabled' : ''}
                    />
                    <div id="name-error" style="font-size: 12px; color: #ef4444; margin-top: 4px;"></div>
                </div>

                ${currentType === 'heading' ? `
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Title size</label>
                        <select id="swal-tag" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; box-sizing: border-box; font-size: 14px;">
                            <option value="h1" ${node.tag === 'h1' ? 'selected' : ''}>Main title</option>
                            <option value="h2" ${node.tag === 'h2' ? 'selected' : ''}>Subtitle</option>
                            <option value="h3" ${node.tag === 'h3' ? 'selected' : ''}>Section title</option>
                            <option value="h4" ${node.tag === 'h4' ? 'selected' : ''}>Minimal title</option>
                            <option value="h5" ${node.tag === 'h5' ? 'selected' : ''}>Small title</option>
                            <option value="h6" ${node.tag === 'h6' ? 'selected' : ''}>Caption title</option>
                        </select>
                    </div>
                ` : ''}

                ${currentType === 'icon' ? `
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Icon Role</label>
                        <select id="swal-icon-role" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; box-sizing: border-box; font-size: 14px;">
                            <option value="regularIcon" ${node.role !== 'sectionTitleIcon' ? 'selected' : ''}>Regular content icon</option>
                            <option value="sectionTitleIcon" ${node.role === 'sectionTitleIcon' ? 'selected' : ''}>Section title icon</option>
                        </select>
                    </div>
                ` : ''}
                ${currentType === 'icon' ? `
                    <div id="icon-selector-container" style="margin-bottom: 16px; min-height: 200px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Select Icon</label>
                        <div id="loading-indicator" style="display: none; text-align: center; padding: 20px; color: #6b7280;">
                            Loading icons...
                        </div>
                        <div id="icon-selector-root"></div>
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
            didOpen: async () => {
                const nameInput = document.getElementById('swal-name') as HTMLInputElement;
                const validateName = () => {
                    const title = nameInput?.value.trim();
                    const errorDiv = document.getElementById('name-error');
                    if (USER_NAME_TYPES.includes(currentType) && !title) {
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

                if (currentType === 'icon') {
                    selectedIconValueRef.current = content?.value || 'FaUser';
                    const renderIconSelector = async () => {
                        const container = document.getElementById('icon-selector-root');
                        const loadingIndicator = document.getElementById('loading-indicator');
                        if (!container) return;
                        if (iconRootRef.current) {
                            iconRootRef.current.unmount();
                            iconRootRef.current = null;
                        }
                        if (loadingIndicator) loadingIndicator.style.display = 'block';
                        const loaded = await loadIconSelector();
                        if (loadingIndicator) loadingIndicator.style.display = 'none';
                        if (loaded && IconSelectorRef.current) {
                            iconRootRef.current = createRoot(container);
                            iconRootRef.current.render(
                                <IconSelectorRef.current
                                    onSelect={(icon: IconItem) => {
                                        selectedIconValueRef.current = icon.name;
                                        const label = document.querySelector('#icon-selector-container label');
                                        if (label) label.innerHTML = `Selected Icon: <strong style="color: #10b981;">${selectedIconValueRef.current}</strong>`;
                                    }}
                                    selectedIcon={getIconMetadata(selectedIconValueRef.current) ?? null}
                                />
                            );
                        }
                    };
                    const label = document.querySelector('#icon-selector-container label');
                    if (label) label.innerHTML = `Selected Icon: <strong style="color: #10b981;">${selectedIconValueRef.current}</strong>`;
                    void renderIconSelector();
                }

                const confirmButton = document.querySelector('.swal2-confirm') as HTMLElement;
                confirmButton?.addEventListener('click', (e) => {
                    if (USER_NAME_TYPES.includes(currentType)) {
                        const name = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
                        if (!name) {
                            e.preventDefault();
                            Swal.showValidationMessage('⚠️ Name is required!');
                        }
                    }
                    if (currentType === 'icon' && !selectedIconValueRef.current) {
                        e.preventDefault();
                        Swal.showValidationMessage('⚠️ Please select an icon!');
                    }
                });
            },
            willClose: () => {
                if (iconRootRef.current) {
                    iconRootRef.current.unmount();
                    iconRootRef.current = null;
                }
            },
            preConfirm: () => {
                let title = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
                let value = (document.getElementById('swal-value') as HTMLInputElement)?.value || '';
                const tag = (document.getElementById('swal-tag') as HTMLSelectElement)?.value || node.tag;

                if (FIXED_NAME_TYPES.includes(currentType)) {
                    title = currentType;
                }

                if (currentType === 'image') {
                    value = '/images/user-photo.avif';
                }

                if (currentType === 'link') {
                    value = 'https://example.com|Link Text';
                }

                if (currentType === 'icon') {
                    value = selectedIconValueRef.current;
                } else if (tagsWithoutValue.includes(tag)) {
                    value = '';
                }

                try {
                    if (USER_NAME_TYPES.includes(currentType)) validation.validateFieldTitle(title);
                    if (currentType === 'icon' && !value) throw new Error('Please select an icon.');
                    if (!tagsWithoutValue.includes(tag) && currentType !== 'image' && currentType !== 'link' && currentType !== 'icon') validation.validateContentValue(tag, value);
                } catch (error) {
                    Swal.showValidationMessage(error instanceof Error ? error.message : 'Element validation failed.');
                    return false;
                }

                const role = currentType === 'icon' ? ((document.getElementById('swal-icon-role') as HTMLSelectElement)?.value as 'regularIcon' | 'sectionTitleIcon') || 'regularIcon' : undefined;

                return { title, value, tag, role };
            }
        });

        if (result.isConfirmed && result.value) {
            const { title, value, tag, role } = result.value;
            try {
                updateNode(node.id, tag, role);
                if (value !== undefined) updateContent(node.id, value, title ? { title } : undefined);
                await Swal.fire({ icon: 'success', title: 'Updated', text: 'Element updated successfully.', timer: 1200, showConfirmButton: false });
            } catch (error) {
                await Swal.fire({ icon: 'error', title: 'Update failed', text: error instanceof Error ? error.message : 'Element validation failed.' });
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