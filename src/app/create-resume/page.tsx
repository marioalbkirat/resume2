'use client';
import { useState } from 'react';
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2Engine from './components/Step2Engine';
import StepNavigation from './components/StepNavigation';
import { ResumeCategory, Visibility } from '@prisma/client';
import { SectionStyle } from '@/types/resume/SectionStyle';
import StepStyle from './components/StepStyle';
export interface SectionDistribution {
    order: number;
    position: "left" | "right" | null;
    visible: boolean;
    showIcon: boolean;
}
export interface Engine {
    settings: {
        direction: "LTR" | "RTL",
        showIcons: boolean,
        pageSize: "A4" | "Letter",
    },
    layout: {
        columns: "ONE" | "TWO",
        sidebar?: {
            position: "LEFT" | "RIGHT" | null
        },
        distribution: Record<string, SectionDistribution>;
    },
}
export default function Page() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [targetRoles, setTargetRoles] = useState<string[]>([""]);
    const [category, setCategory] = useState<ResumeCategory>("REGULAR");
    const [visibility, setVisibility] = useState<Visibility>("COMMUNITY");
    const [engine, setEngine] = useState<Engine>({
        settings: {
            direction: "LTR",
            showIcons: true,
            pageSize: "A4"
        },
        layout: {
            columns: "TWO",
            sidebar: { position: "LEFT" },
            distribution: {},
        },
    });
    const [style, setStyle] = useState<SectionStyle[] | null>(null);
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return true;
            default:
                return false;
        }
    };
    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
    };
    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/resume-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(""),
            });
            if (response.ok) {
                const result = await response.json();
                window.location.href = '/dashboard/templates';
            } else {
                throw new Error('Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Error creating template. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1BasicInfo
                    name={name}
                    image={image}
                    description={description}
                    targetRoles={targetRoles}
                    category={category}
                    visibility={visibility}
                    setName={setName}
                    setImage={setImage}
                    setDescription={setDescription}
                    setTargetRoles={setTargetRoles}
                    setCategory={setCategory}
                    setVisibility={setVisibility}
                />;
            case 2:
                return <Step2Engine engine={engine} setEngine={setEngine} />;
            case 3: return <StepStyle engine={engine} style={style} setStyle={setStyle} />
            default:
                return null;
        }
    };
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            <div className="max-w-400 mx-auto py-8 px-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Create New Resume Template
                    </h1>
                    <p className="text-gray-500">
                        Design a professional resume template with an intuitive visual builder
                    </p>
                </div>
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="flex justify-between items-center">
                        {['Basic Info', 'Layout & Sections', 'Styling'].map((label, index) => (
                            <div key={index} className="flex-1 text-center">
                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${currentStep > index + 1
                                    ? 'bg-green-500 text-white'
                                    : currentStep === index + 1
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {currentStep > index + 1 ? '✓' : index + 1}
                                </div>
                                <div className="text-xs mt-2 text-gray-600">{label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="relative mt-2">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
                        <div
                            className="absolute top-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 -z-10"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        {loading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-4 text-gray-700">Creating your template...</p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={(e) => e.preventDefault()}>
                            {renderStep()}
                            <StepNavigation currentStep={currentStep} totalSteps={3} onNext={handleNext} onPrev={handlePrev}
                                onSubmit={handleSubmit} isLastStep={currentStep === 3} canGoNext={validateStep(currentStep)} />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}