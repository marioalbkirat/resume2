// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\componenets\AddNode.tsx
import { Schema } from '@/types/resume/Section';
import { FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { createRoot, Root } from 'react-dom/client';
import { ComponentType, useRef } from 'react';
import { IconItem } from '@/hooks/PickIcons/icons';
import { useSectionBuilder } from '../useSectionBuilder';
import { SectionValidation } from '@/classes/section/SectionValidation';
const validation = new SectionValidation();

export default function AddNode({ node, builder }: { node: Schema; builder: ReturnType<typeof useSectionBuilder> }) {
    const { addNode, allowedTagChildren, getAlias, getTagsWithoutValue } = builder;
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
    const iconRootRef = useRef<Root | null>(null);
    const IconSelectorRef = useRef<ComponentType<{ onSelect: (icon: IconItem) => void; selectedIcon?: IconItem | null; className?: string; }> | null>(null);
    const selectedIconValueRef = useRef<string>('FaUser');
    const loadIconSelector = async () => {
        try {
            const myModule = await import('@/hooks/PickIcons/icons/PickIcons');
            IconSelectorRef.current = myModule.default;
            return true;
        } catch {
            return false;
        }
    };
    const showForm = async () => {
        const allowedTags = allowedTagChildren(node.tag);
        const aliasMap = getAlias();
        const availableTypes = [...new Set(allowedTags.map(tag => aliasMap[tag]).filter(Boolean))];
        let selectedType = availableTypes[0];
        const tagsWithoutValue = getTagsWithoutValue();

        const htmlContent = `
            <div style="text-align: left; direction: ltr;">
                <div style="margin-bottom: 16px; padding: 10px; background: #eff6ff; border-radius: 8px; font-size: 14px; color: #1e40af;">
                    💡 Adding to: <strong>${node.type}</strong> (${node.tag})
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Element Type</label>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                        ${availableTypes.map(type => {
            const info = typeOptions[type];
            if (!info) return '';
            return `
                                <div data-type="${type}" class="type-card" style="cursor: pointer; border-radius: 8px; border: 2px solid #e5e7eb; padding: 12px; text-align: center; transition: all 0.2s; background-color: ${info.color};">
                                    <div style="font-size: 24px; margin-bottom: 4px;">${info.icon}</div>
                                    <div style="font-size: 13px; font-weight: 500; color: #374151;">${info.label}</div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
                <div id="name-container" style="margin-bottom: 16px; display: ${USER_NAME_TYPES.includes(selectedType) ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Name <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="swal-name" 
                        style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px;"
                        placeholder="e.g., Company name"
                    />
                    <div id="name-error" style="font-size: 12px; color: #ef4444; margin-top: 4px;"></div>
                </div>
                <div id="tag-container" style="margin-bottom: 16px; display: ${selectedType === 'heading' ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Title size</label>
                    <select id="swal-tag" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; box-sizing: border-box; font-size: 14px;">
                        <option value="h1">Main title</option>
                        <option value="h2" selected>Subtitle</option>
                        <option value="h3">Section title</option>
                        <option value="h4">Minimal title</option>
                        <option value="h5">Small title</option>
                        <option value="h6">Caption title</option>
                    </select>
                </div>
                <div id="value-container" style="margin-bottom: 16px; display: ${!tagsWithoutValue.includes(typeOptions[selectedType]?.defaultTag || '') && selectedType !== 'image' && selectedType !== 'link' && selectedType !== 'icon' ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                        Value <span style="color: #9ca3af; font-size: 12px;">(optional)</span>
                    </label>
                    <input type="text" id="swal-value" 
                        style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px;"
                        placeholder="Enter default value"
                    />
                </div>
                <div id="icon-role-container" style="margin-bottom: 16px; display: ${selectedType === 'icon' ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Icon Role</label>
                    <select id="swal-icon-role" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; box-sizing: border-box; font-size: 14px;">
                        <option value="regularIcon">Regular content icon</option>
                        <option value="sectionTitleIcon">Section title icon</option>
                    </select>
                </div>
                <div id="icon-selector-container" style="margin-bottom: 16px; display: ${selectedType === 'icon' ? 'block' : 'none'}; min-height: 200px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Select Icon</label>
                    <div id="loading-indicator" style="display: none; text-align: center; padding: 20px; color: #6b7280;">
                        Loading icons...
                    </div>
                    <div id="icon-selector-root"></div>
                </div>
            </div>
        `;

        const result = await Swal.fire({
            title: 'Add New Element',
            html: htmlContent,
            width: '650px',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '✓ Add',
            cancelButtonText: '✗ Cancel',
            showCloseButton: true,
            didOpen: async () => {
                const cards = document.querySelectorAll('.type-card');
                const updateSelection = () => {
                    cards.forEach(card => {
                        (card as HTMLElement).style.borderColor = '#e5e7eb';
                        (card as HTMLElement).style.outline = 'none';
                    });
                    const selected = document.querySelector(`.type-card[data-type="${selectedType}"]`);
                    if (selected) {
                        (selected as HTMLElement).style.borderColor = '#3b82f6';
                        (selected as HTMLElement).style.outline = '2px solid #93c5fd';
                    }
                };

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
                                onSelect={(icon: { name: string }) => {
                                    selectedIconValueRef.current = icon.name;
                                    const label = document.querySelector('#icon-selector-container label');
                                    if (label && selectedIconValueRef.current) label.innerHTML = `Selected Icon: <strong style="color: #10b981;">${selectedIconValueRef.current}</strong>`;
                                }}
                                selectedIcon={undefined}
                            />
                        );
                    }
                };

                const updateForm = (type: string) => {
                    const info = typeOptions[type];
                    if (!info) return;
                    const nameContainer = document.getElementById('name-container');
                    const nameInput = document.getElementById('swal-name') as HTMLInputElement;
                    if (USER_NAME_TYPES.includes(type)) {
                        nameContainer!.style.display = 'block';
                        nameInput.value = '';
                        nameInput.disabled = false;
                        nameInput.style.backgroundColor = 'white';
                        nameInput.style.color = 'black';
                    } else {
                        nameContainer!.style.display = 'none';
                        nameInput.value = type;
                    }
                    const tagContainer = document.getElementById('tag-container');
                    if (type === 'heading') tagContainer!.style.display = 'block';
                    else tagContainer!.style.display = 'none';
                    const valueContainer = document.getElementById('value-container');
                    const valueInput = document.getElementById('swal-value') as HTMLInputElement;
                    const defaultTag = info.defaultTag;
                    const iconContainer = document.getElementById('icon-selector-container');
                    const iconRoleContainer = document.getElementById('icon-role-container');
                    if (type === 'icon') {
                        iconContainer!.style.display = 'block';
                        iconRoleContainer!.style.display = 'block';
                        selectedIconValueRef.current = 'FaUser';
                        const label = document.querySelector('#icon-selector-container label');
                        if (label) label.innerHTML = 'Select Icon';
                        setTimeout(() => renderIconSelector(), 100);
                    } else {
                        iconContainer!.style.display = 'none';
                        iconRoleContainer!.style.display = 'none';
                        if (iconRootRef.current) {
                            iconRootRef.current.unmount();
                            iconRootRef.current = null;
                        }
                    }
                    if (type === 'image' || type === 'link' || type === 'icon' || tagsWithoutValue.includes(defaultTag)) valueContainer!.style.display = 'none';
                    else {
                        valueContainer!.style.display = 'block';
                        valueInput.value = '';
                        valueInput.disabled = false;
                    }
                };

                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        const type = card.getAttribute('data-type');
                        if (type) {
                            selectedType = type;
                            updateSelection();
                            updateForm(type);
                        }
                    });
                });

                const nameInput = document.getElementById('swal-name') as HTMLInputElement;
                const validateName = () => {
                    const name = nameInput?.value.trim();
                    const errorDiv = document.getElementById('name-error');
                    if (USER_NAME_TYPES.includes(selectedType) && !name) {
                        errorDiv!.textContent = '⚠️ Name is required';
                        nameInput!.style.borderColor = '#ef4444';
                        nameInput!.style.backgroundColor = '#fef2f2';
                        return false;
                    } else {
                        errorDiv!.textContent = '';
                        nameInput!.style.borderColor = '#d1d5db';
                        nameInput!.style.backgroundColor = 'white';
                        return true;
                    }
                };
                nameInput?.addEventListener('input', validateName);

                updateForm(selectedType);
                updateSelection();

                const confirmButton = document.querySelector('.swal2-confirm') as HTMLElement;
                confirmButton?.addEventListener('click', (e) => {
                    if (USER_NAME_TYPES.includes(selectedType)) {
                        const name = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
                        if (!name) {
                            e.preventDefault();
                            Swal.showValidationMessage('⚠️ Name is required!');
                        }
                    }
                    if (selectedType === 'icon' && !selectedIconValueRef.current) {
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
                const name = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
                let value = (document.getElementById('swal-value') as HTMLInputElement)?.value || '';
                let tag = (document.getElementById('swal-tag') as HTMLSelectElement)?.value;
                if (selectedType === 'heading') tag = tag || 'h2';
                else tag = typeOptions[selectedType]?.defaultTag || selectedType;

                try {
                    if (USER_NAME_TYPES.includes(selectedType)) validation.validateFieldTitle(name);
                    if (selectedType === 'icon' && !selectedIconValueRef.current) throw new Error('Please select an icon.');
                } catch (error) {
                    Swal.showValidationMessage(error instanceof Error ? error.message : 'Element validation failed.');
                    return false;
                }

                if (selectedType === 'image') value = '/images/user-photo.avif';
                if (selectedType === 'link') value = 'Link Text';
                if (selectedType === 'icon') value = selectedIconValueRef.current;
                if (tagsWithoutValue.includes(tag)) value = '';

                let finalName = name;
                if (FIXED_NAME_TYPES.includes(selectedType)) finalName = selectedType;
                try {
                    if (!finalName) throw new Error('Name is required.');
                    if (USER_NAME_TYPES.includes(selectedType)) validation.validateFieldTitle(finalName);
                    if (!tagsWithoutValue.includes(tag) && selectedType !== 'image' && selectedType !== 'link' && selectedType !== 'icon') validation.validateContentValue(tag, value);
                } catch (error) {
                    Swal.showValidationMessage(error instanceof Error ? error.message : 'Element validation failed.');
                    return false;
                }

                let props = {};
                if (selectedType === 'image') props = { src: '/images/user-photo.avif', alt: 'Image' };
                if (selectedType === 'link') props = { href: 'https://example.com' };

                const role = selectedType === 'icon' ? ((document.getElementById('swal-icon-role') as HTMLSelectElement)?.value as 'regularIcon' | 'sectionTitleIcon') || 'regularIcon' : undefined;

                return { type: selectedType, name: finalName, value, tag, props, role };
            }
        });

        if (result.isConfirmed && result.value) {
            const { type, name, value, tag, props, role } = result.value;
            try {
                addNode(tag, type, name, node.id, value, props, role);
                await Swal.fire({ icon: 'success', title: 'Added', text: 'Element added successfully.', timer: 1200, showConfirmButton: false });
            } catch (error) {
                await Swal.fire({ icon: 'error', title: 'Add failed', text: error instanceof Error ? error.message : 'Element validation failed.' });
            }
        }
    };
    return (
        <button
            onClick={showForm}
            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer group"
            title="Add child element"
        >
            <FiPlus size={14} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}