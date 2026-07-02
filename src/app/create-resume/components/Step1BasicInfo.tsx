'use client';
import { ResumeCategory, Visibility } from '@prisma/client';
import React, { useState } from 'react';
interface Step1BasicInfoProps {
    name: string,
    image: string,
    description: string,
    targetRoles: string[],
    category: ResumeCategory,
    visibility: Visibility,
    setName: (e: string) => void;
    setImage: (e: string) => void;
    setDescription: (e: string) => void;
    setTargetRoles: (e: string[]) => void;
    setCategory: (e: ResumeCategory) => void;
    setVisibility: (e: Visibility) => void;
}
export default function Step1BasicInfo({ name, image, description, targetRoles, category, visibility, setName, setImage, setDescription, setTargetRoles, setCategory, setVisibility }: Step1BasicInfoProps) {
    const [targetRoleInput, setTargetRoleInput] = useState('');
    const addTargetRole = () => {
        if (targetRoleInput.trim() && !targetRoles.includes(targetRoleInput.trim())) {
            setTargetRoles([...targetRoles, targetRoleInput.trim()]);
            setTargetRoleInput('');
        }
    };
    const removeTargetRole = (role: string) => {
        setTargetRoles(targetRoles.filter(r => r !== role));
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string)
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter template name" required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Image
                </label>
                <div className="flex items-center space-x-4">
                    <button type="button"
                        onClick={() => document.getElementById('imageUpload')?.click()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Upload Image
                    </button>
                    <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    {image && (
                        <div className="relative">
                            <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            <button
                                onClick={() => setImage("")}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                </label>
                <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as Visibility)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value={Visibility.OFFICIAL}>{Visibility.OFFICIAL}</option>
                    <option value={Visibility.COMMUNITY}>{Visibility.COMMUNITY}</option>
                    <option value={Visibility.PRIVATE}>{Visibility.PRIVATE}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input type="radio"
                            value={ResumeCategory.ATS}
                            checked={category === ResumeCategory.ATS}
                            onChange={(e) => setCategory(e.target.value as ResumeCategory)}
                            className="mr-2"
                        />
                        ATS (Applicant Tracking System Friendly)
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value={ResumeCategory.REGULAR}
                            checked={category === ResumeCategory.REGULAR}
                            onChange={(e) => setCategory(e.target.value as ResumeCategory)}
                            className="mr-2"
                        />
                        Regular
                    </label>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Roles
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={targetRoleInput}
                        onChange={(e) => setTargetRoleInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTargetRole()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add role (e.g., Frontend Developer)"
                    />
                    <button
                        type="button"
                        onClick={addTargetRole}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {targetRoles.map((role, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                            {role}
                            <button
                                onClick={() => removeTargetRole(role)}
                                className="ml-2 hover:text-blue-900"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Template description (max 200 characters)"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                    {description.length}/200
                </div>
            </div>
        </div>
    );
}